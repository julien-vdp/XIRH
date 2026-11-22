<?php
namespace local_xirhmail;
defined('MOODLE_INTERNAL') || die();

/** Mailbox synchronisation and explicit, auditable invitation submission. */
final class tracker {
    public static function sync(?mailbox_client $client = null): array {
        global $CFG;
        if (!get_config('local_xirhmail', 'enabled')) {
            throw new \moodle_exception('syncdisabled', 'local_xirhmail');
        }
        $mailbox = (string)get_config('local_xirhmail', 'mailbox');
        if (!$mailbox || !validate_email($mailbox) || strcasecmp($mailbox, $CFG->smtpuser ?? '') !== 0 ||
                strcasecmp($mailbox, $CFG->noreplyaddress ?? '') !== 0 || empty($CFG->smtppass) || !empty($CFG->handlebounces)) {
            throw new \moodle_exception('mailboxmismatch', 'local_xirhmail');
        }
        $lock = \core\lock\lock_config::get_lock_factory('local_xirhmail')->get_lock('sync', 0);
        if (!$lock) {
            throw new \moodle_exception('busy', 'local_xirhmail');
        }
        $client = $client ?? new mailbox_client();
        try {
            $validity = $client->connect($mailbox, $CFG->smtppass);
            $identity = hash('sha256', strtolower($mailbox) . ':' . $validity);
            $after = get_config('local_xirhmail', 'cursoridentity') === $identity ?
                (int)get_config('local_xirhmail', 'cursor') : 0;
            $result = ['scanned' => 0, 'added' => 0, 'oversize' => 0];
            foreach ($client->search($after) as $uid) {
                $message = $client->message($uid);
                $result['scanned']++;
                $result['oversize'] += (int)$message['oversize'];
                $outer = dsn_parser::headers(explode("\n\n", str_replace("\r\n", "\n", $message['raw']), 2)[0]);
                $key = $outer['message-id'] ?? ($identity . ':' . $uid);
                foreach (dsn_parser::parse($message['raw']) as $report) {
                    $eventhash = hash('sha256', strtolower($mailbox) . ':' . $key . ':' . $report['email'] . ':' . $report['status']);
                    $result['added'] += (int)self::record_bounce($report, $eventhash, $message['received']);
                }
                // Advance only after the message has been completely processed; retry is idempotent.
                set_config('cursoridentity', $identity, 'local_xirhmail');
                set_config('cursor', $uid, 'local_xirhmail');
            }
            set_config('lastsync', time(), 'local_xirhmail');
            set_config('syncerror', '', 'local_xirhmail');
            set_config('oversize', $result['oversize'], 'local_xirhmail');
            return $result;
        } catch (\Throwable $e) {
            // Raw mailbox errors may contain server details or credentials. Keep only a fixed message.
            set_config('syncerror', 'syncfailed', 'local_xirhmail');
            throw new \moodle_exception('syncfailed', 'local_xirhmail');
        } finally {
            $client->close();
            $lock->release();
        }
    }

    public static function record_bounce(array $report, string $eventhash, int $received): bool {
        global $DB;
        if ($DB->record_exists('local_xirhmail_bounce', ['eventhash' => $eventhash])) {
            return false;
        }
        $userids = array_keys($DB->get_records_select('user',
            'LOWER(email) = :email AND deleted = 0', ['email' => $report['email']], '', 'id'));
        if (!$userids && $report['messageid'] !== '') {
            $userids = array_unique(array_column($DB->get_records('local_xirhmail_invite',
                ['messageid' => $report['messageid'], 'email' => $report['email']], '', 'id,userid'), 'userid'));
        }
        $record = (object)$report;
        $record->userid = count($userids) === 1 ? (int)reset($userids) : 0;
        $record->eventhash = $eventhash;
        $record->timecreated = min(time(), max(0, $received));
        $DB->insert_record('local_xirhmail_bounce', $record);
        return true;
    }

    public static function eligible(\stdClass $user): bool {
        return empty($user->deleted) && empty($user->suspended) && empty($user->emailstop) &&
            !in_array($user->auth, ['nologin', 'guest'], true) && validate_email($user->email) &&
            !str_ends_with(strtolower($user->email), '.invalid');
    }

    /** No password reads, resets, credential creation, or student preference changes. */
    public static function send_invitation(int $userid, int $actorid, string $requestkey, string $expectedemail): \stdClass {
        global $DB, $CFG;
        $lock = \core\lock\lock_config::get_lock_factory('local_xirhmail')->get_lock('send-' . $userid, 0);
        if (!$lock) {
            throw new \moodle_exception('busy', 'local_xirhmail');
        }
        try {
            if ($existing = $DB->get_record('local_xirhmail_invite', ['requestkey' => $requestkey])) {
                if ((int)$existing->userid !== $userid || (int)$existing->actorid !== $actorid) {
                    throw new \moodle_exception('invalidrequest', 'error');
                }
                return $existing;
            }
            $fields = 'id,username,email,auth,deleted,suspended,emailstop,mnethostid,mailformat,lang,' .
                implode(',', \core_user\fields::get_name_fields());
            $user = $DB->get_record('user', ['id' => $userid], $fields, MUST_EXIST);
            if (!self::eligible($user) || $user->email !== $expectedemail || empty($CFG->noreplyaddress) ||
                    !validate_email($CFG->noreplyaddress) || !empty($CFG->noemailever) ||
                    !empty($CFG->divertallemailsto) || over_bounce_threshold($user)) {
                throw new \moodle_exception('sendunavailable', 'local_xirhmail');
            }
            if ($DB->record_exists_select('local_xirhmail_invite',
                    'userid = :userid AND email = :email AND timecreated > :since AND state <> :legacy',
                    ['userid' => $userid, 'email' => $user->email, 'since' => time() - 300, 'legacy' => 'legacy'])) {
                throw new \moodle_exception('cooldown', 'local_xirhmail');
            }
            $record = (object)['requestkey' => $requestkey, 'userid' => $userid, 'email' => $user->email,
                'actorid' => $actorid, 'state' => 'sending', 'messageid' => generate_email_messageid(), 'timecreated' => time()];
            // Commit before contacting SMTP. Interrupted submissions remain uncertain and are never auto-retried.
            $record->id = $DB->insert_record('local_xirhmail_invite', $record);
            $html = self::invitation_html($user);
            try {
                $from = clone \core_user::get_noreply_user();
                $from->firstname = 'XIRH Academy';
                $from->lastname = '';
                $from->email = $CFG->noreplyaddress;
                get_mailer()->MessageID = $record->messageid;
                $ok = email_to_user($user, $from, get_string('invitesubject', 'local_xirhmail'),
                    html_to_text($html), $html, '', '', false, $CFG->noreplyaddress, 'XIRH Academy');
                $record->state = $ok ? 'accepted' : 'failed';
            } catch (\Throwable $e) {
                // Submission may have reached SMTP before an exception: keep the uncertainty explicit.
                $record->state = 'uncertain';
            }
            $DB->update_record('local_xirhmail_invite', $record);
            return $record;
        } finally {
            $lock->release();
        }
    }

    public static function invitation_html(\stdClass $user): string {
        global $PAGE, $CFG;
        return $PAGE->get_renderer('core')->render_from_template('local_xirhmail/invitation', [
            'firstname' => $user->firstname, 'username' => $user->username,
            'loginurl' => (new \moodle_url('/login/index.php', ['lang' => 'fr']))->out(false),
            'reseturl' => (new \moodle_url('/login/forgot_password.php', ['lang' => 'fr']))->out(false),
            'supportemail' => $CFG->noreplyaddress,
        ]);
    }

    /** Reports on old addresses remain visible until a new invitation has been explicitly submitted. */
    public static function student_state(\stdClass $user, ?\stdClass $bounce, ?\stdClass $invite): string {
        if ($invite && in_array($invite->state, ['sending', 'uncertain', 'failed'], true) &&
                (!$bounce || $invite->timecreated > $bounce->timecreated)) {
            return $invite->state;
        }
        if ($bounce) {
            $newer = $invite && $invite->state === 'accepted' && (
                ($bounce->messageid !== '' && $invite->messageid === $bounce->messageid) ? false :
                ($bounce->senttime > 0 ? $invite->timecreated > $bounce->senttime :
                    $invite->timecreated > $bounce->timecreated));
            if (!$newer || strcasecmp($invite->email, $user->email) !== 0) {
                if (strcasecmp($bounce->email, $user->email) !== 0) {
                    return 'corrected';
                }
                return $bounce->action === 'delayed' ? 'delayed' : 'bounced';
            }
        }
        return $invite && $invite->state === 'accepted' && strcasecmp($invite->email, $user->email) === 0 ?
            'accepted' : 'noreturn';
    }

    public static function cleanup(): void {
        global $DB;
        $days = max(30, min(730, (int)(get_config('local_xirhmail', 'retentiondays') ?: 180)));
        foreach (['local_xirhmail_bounce', 'local_xirhmail_invite'] as $table) {
            $DB->delete_records_select($table, 'timecreated < ?', [time() - $days * DAYSECS]);
        }
    }
}
