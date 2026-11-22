<?php
namespace local_xirhmail;
defined('MOODLE_INTERNAL') || die();

final class report {
    public const ACTION_STATES = ['bounced', 'delayed', 'corrected', 'failed', 'uncertain', 'sending'];

    public static function data(int $cohortid, string $filter, int $page): array {
        global $DB;
        $fields = 'u.id,u.email,u.username,u.auth,u.deleted,u.suspended,u.emailstop,u.firstaccess,' .
            implode(',', array_map(static fn($field) => 'u.' . $field, \core_user\fields::get_name_fields()));
        $params = [];
        $cohortsql = '';
        if ($cohortid) {
            $cohortsql = ' AND cm.cohortid = :cohortid';
            $params['cohortid'] = $cohortid;
        }
        $users = $DB->get_records_sql("SELECT $fields FROM {user} u WHERE u.deleted = 0 AND u.id <> 1
            AND EXISTS (SELECT 1 FROM {cohort_members} cm WHERE cm.userid = u.id $cohortsql)
            ORDER BY u.lastname,u.firstname,u.id", $params);
        $bounces = $DB->get_records_sql('SELECT b.* FROM {local_xirhmail_bounce} b WHERE b.userid > 0
            AND NOT EXISTS (SELECT 1 FROM {local_xirhmail_bounce} newer WHERE newer.userid=b.userid
            AND (newer.timecreated > b.timecreated OR (newer.timecreated=b.timecreated AND newer.id > b.id)))');
        $invites = $DB->get_records_sql('SELECT i.* FROM {local_xirhmail_invite} i WHERE NOT EXISTS
            (SELECT 1 FROM {local_xirhmail_invite} newer WHERE newer.userid=i.userid AND newer.id > i.id)');
        $bymember = [];
        $sentbymember = [];
        foreach ($bounces as $bounce) {
            $bymember[$bounce->userid] = $bounce;
        }
        foreach ($invites as $invite) {
            $sentbymember[$invite->userid] = $invite;
        }
        $rows = [];
        $todo = 0;
        foreach ($users as $user) {
            $bounce = $bymember[$user->id] ?? null;
            $invite = $sentbymember[$user->id] ?? null;
            $state = tracker::student_state($user, $bounce, $invite);
            $actionneeded = in_array($state, self::ACTION_STATES, true);
            $todo += (int)$actionneeded;
            if ($filter === 'todo' && !$actionneeded) {
                continue;
            }
            $reason = $bounce ? get_string('reason_other', 'local_xirhmail') : '';
            if ($bounce && in_array($bounce->status, ['5.4.1', '5.1.1', '5.1.10'], true)) {
                $reason = get_string('reason_address', 'local_xirhmail');
            } else if ($bounce && str_starts_with($bounce->status, '4.')) {
                $reason = get_string('reason_temporary', 'local_xirhmail');
            }
            $rows[] = [
                'name' => fullname($user), 'email' => $user->email, 'username' => $user->username,
                'state' => $state, 'statelabel' => get_string('state_' . $state, 'local_xirhmail'),
                'actionneeded' => $actionneeded, 'hasbounce' => (bool)$bounce,
                'reason' => $reason, 'code' => $bounce->status ?? '', 'diagnostic' => $bounce->diagnostic ?? '',
                'oldemail' => $bounce && strcasecmp($bounce->email, $user->email) !== 0 ? $bounce->email : '',
                'bouncedate' => $bounce ? userdate($bounce->timecreated, get_string('strftimedatetimeshort')) : '',
                'sentdate' => $invite ? userdate($invite->timecreated, get_string('strftimedatetimeshort')) : '',
                'connected' => (bool)$user->firstaccess,
                'caninvite' => tracker::eligible($user),
                'inviteurl' => (new \moodle_url('/local/xirhmail/invite.php', ['userid' => $user->id,
                    'cohortid' => $cohortid]))->out(false),
                'editurl' => (new \moodle_url('/user/editadvanced.php', ['id' => $user->id,
                    'course' => SITEID]))->out(false),
            ];
        }
        $count = count($rows);
        $page = max(0, min($page, max(0, (int)ceil($count / 50) - 1)));
        $unmatched = $DB->get_records('local_xirhmail_bounce', ['userid' => 0], 'timecreated DESC',
            'id,email,status,timecreated', 0, 20);
        return ['rows' => array_slice($rows, $page * 50, 50), 'filteredcount' => $count, 'page' => $page,
            'total' => count($users), 'todo' => $todo, 'other' => count($users) - $todo,
            'unmatched' => array_values(array_map(static fn($b) => ['email' => $b->email, 'code' => $b->status,
                'date' => userdate($b->timecreated, get_string('strftimedatetimeshort'))], $unmatched))];
    }
}
