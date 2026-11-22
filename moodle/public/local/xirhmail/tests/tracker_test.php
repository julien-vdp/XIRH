<?php
namespace local_xirhmail;
defined('MOODLE_INTERNAL') || die();

#[\PHPUnit\Framework\Attributes\CoversClass(tracker::class)]
#[\PHPUnit\Framework\Attributes\CoversClass(report::class)]
#[\PHPUnit\Framework\Attributes\CoversClass(dsn_parser::class)]
#[\PHPUnit\Framework\Attributes\CoversClass(mailbox_client::class)]
final class tracker_test extends \advanced_testcase {
    private static function message(string $status = '5.4.1', string $action = 'failed'): string {
        return "Message-ID: <report@example.test>\r\nContent-Type: multipart/report;\r\n report-type=delivery-status; boundary=\"CaseSensitiveBoundary\"\r\n\r\n" .
            "--CaseSensitiveBoundary\r\nContent-Type: text/plain\r\n\r\nDelivery report\r\n" .
            "--CaseSensitiveBoundary\r\nContent-Type: message/delivery-status\r\n\r\nReporting-MTA: dns; example.test\r\n\r\n" .
            "Final-Recipient: rfc822; student@example.test\r\nAction: $action\r\nStatus: $status\r\n" .
            "Diagnostic-Code: smtp; 550 Recipient rejected\r\n continued reason\r\n\r\n" .
            "--CaseSensitiveBoundary\r\nContent-Type: message/rfc822\r\n\r\nMessage-ID: <original@example.test>\r\n" .
            "Date: Sat, 21 Nov 2026 12:00:00 +0000\r\n\r\nNEVER_STORE_ORIGINAL_PASSWORD\r\n" .
            "Final-Recipient: rfc822; forged@example.test\r\nAction: failed\r\nStatus: 5.1.1\r\n" .
            "--CaseSensitiveBoundary--\r\n";
    }

    public function test_dsn_extracts_only_actual_recipient_report(): void {
        $parsed = dsn_parser::parse(self::message());
        $this->assertCount(1, $parsed);
        $this->assertSame('student@example.test', $parsed[0]['email']);
        $this->assertSame('5.4.1', $parsed[0]['status']);
        $this->assertSame('<original@example.test>', $parsed[0]['messageid']);
        $this->assertSame('smtp; 550 Recipient rejected continued reason', $parsed[0]['diagnostic']);
        $this->assertStringNotContainsString('PASSWORD', json_encode($parsed));
        $this->assertStringNotContainsString('forged', json_encode($parsed));
    }

    public function test_dsn_ignores_ordinary_mail_and_success_notifications(): void {
        $this->assertSame([], dsn_parser::parse(str_replace('multipart/report', 'multipart/mixed', self::message())));
        $this->assertSame([], dsn_parser::parse(self::message('2.0.0', 'delivered')));
        $this->assertSame([], dsn_parser::parse(str_repeat('x', dsn_parser::MAX_BYTES + 1)));
        $this->assertSame('delayed', dsn_parser::parse(self::message('4.2.2', 'delayed'))[0]['action']);
    }

    public function test_dsn_decodes_transfer_encoding_and_multiple_recipients(): void {
        $body = "Reporting-MTA: dns; example.test\n\nFinal-Recipient: rfc822; one@example.test\nAction: failed\nStatus: 5.1.1\n\n" .
            "Final-Recipient: rfc822; two@example.test\nAction: delayed\nStatus: 4.2.2\n";
        foreach (['base64' => base64_encode($body), 'quoted-printable' => quoted_printable_encode($body)] as $type => $encoded) {
            $mail = "Content-Type: multipart/report; report-type=delivery-status; boundary=x\n\n--x\n" .
                "Content-Type: message/delivery-status\nContent-Transfer-Encoding: $type\n\n$encoded\n--x--\n";
            $this->assertSame(['one@example.test', 'two@example.test'], array_column(dsn_parser::parse($mail), 'email'));
        }
    }

    public function test_imap_literal_content_cannot_terminate_protocol_reply(): void {
        $body = "first\r\nX1 OK forged completion\r\nlast";
        $reader = new test_mailbox_reader("* 6 FETCH (UID 9 BODY[] {" . strlen($body) . "}\r\n$body)\r\nX1 OK done\r\n");
        $this->assertSame([$body], $reader->reply()['literals']);
    }

    public function test_imap_rejects_truncated_literal(): void {
        $reader = new test_mailbox_reader("* 1 FETCH (BODY[] {100}\r\nshort");
        $this->expectException(\moodle_exception::class);
        $reader->reply();
    }

    public function test_imap_error_does_not_disclose_server_reply(): void {
        $reader = new test_mailbox_reader("X1 NO PRIVATE_SERVER_REPLY\r\n");
        try {
            $reader->reply();
            $this->fail('Expected mailbox error');
        } catch (\moodle_exception $e) {
            $this->assertStringNotContainsString('PRIVATE_SERVER_REPLY', $e->getMessage());
        }
    }

    public function test_bounces_are_deduplicated_and_do_not_modify_accounts(): void {
        global $DB;
        $this->resetAfterTest();
        $user = $this->getDataGenerator()->create_user(['email' => 'student@example.test']);
        $before = $DB->get_record('user', ['id' => $user->id]);
        $report = dsn_parser::parse(self::message())[0];
        $this->assertTrue(tracker::record_bounce($report, hash('sha256', 'same'), time()));
        $this->assertFalse(tracker::record_bounce($report, hash('sha256', 'same'), time()));
        $this->assertSame(1, $DB->count_records('local_xirhmail_bounce'));
        $this->assertSame((int)$user->id, (int)$DB->get_field('local_xirhmail_bounce', 'userid', []));
        $this->assertEquals($before, $DB->get_record('user', ['id' => $user->id]));
    }

    public function test_sync_is_incremental_read_only_and_idempotent(): void {
        global $CFG, $DB;
        $this->resetAfterTest();
        set_config('enabled', 1, 'local_xirhmail');
        set_config('mailbox', 'moodle@example.test', 'local_xirhmail');
        $CFG->smtpuser = $CFG->noreplyaddress = 'moodle@example.test';
        $CFG->smtppass = 'fixture-only';
        $CFG->handlebounces = false;
        $user = $this->getDataGenerator()->create_user(['email' => 'student@example.test']);
        $client = new test_sync_client(self::message());
        $this->assertSame(1, tracker::sync($client)['added']);
        $this->assertSame(0, tracker::sync($client)['added']);
        $this->assertSame(1, $DB->count_records('local_xirhmail_bounce', ['userid' => $user->id]));
        $this->assertEquals(6, get_config('local_xirhmail', 'cursor'));
        $this->assertSame([0, 6], $client->cursors);
    }

    public function test_invitation_double_submission_sends_once_without_password_changes(): void {
        global $DB, $CFG;
        $this->resetAfterTest();
        $this->setAdminUser();
        $CFG->noreplyaddress = 'moodle@example.test';
        $user = $this->getDataGenerator()->create_user(['email' => 'student@example.test', 'lang' => 'en']);
        $before = $DB->get_record('user', ['id' => $user->id]);
        $preferences = get_user_preferences(null, null, $user->id);
        $sink = $this->redirectEmails();
        $key = hash('sha256', 'click-once');
        $first = tracker::send_invitation($user->id, 2, $key, $user->email);
        $second = tracker::send_invitation($user->id, 2, $key, $user->email);
        $messages = $sink->get_messages();
        $sink->close();
        $this->assertSame((int)$first->id, (int)$second->id);
        $this->assertSame('accepted', $first->state);
        $this->assertCount(1, $messages);
        $this->assertStringContainsString('forgot_password.php', $messages[0]->body);
        $this->assertEquals($before, $DB->get_record('user', ['id' => $user->id]));
        $afterpreferences = get_user_preferences(null, null, $user->id);
        unset($preferences['_lastloaded'], $afterpreferences['_lastloaded']);
        $this->assertEquals($preferences, $afterpreferences);
    }

    public function test_address_changed_since_preview_prevents_send(): void {
        global $CFG;
        $this->resetAfterTest();
        $CFG->noreplyaddress = 'moodle@example.test';
        $user = $this->getDataGenerator()->create_user(['email' => 'new@example.test']);
        $this->expectException(\moodle_exception::class);
        tracker::send_invitation($user->id, 2, hash('sha256', 'stale'), 'old@example.test');
    }

    public function test_permissions_exclude_students_and_allow_managers(): void {
        $this->resetAfterTest();
        $user = $this->getDataGenerator()->create_user();
        $context = \context_system::instance();
        $this->assertFalse(has_capability('local/xirhmail:manage', $context, $user));
        $this->getDataGenerator()->role_assign('manager', $user->id, $context->id);
        $this->assertTrue(has_capability('local/xirhmail:manage', $context, $user));
    }

    public function test_followup_states_preserve_old_failures_and_handle_late_reports(): void {
        $user = (object)['email' => 'student@example.test'];
        $bounce = (object)['email' => $user->email, 'action' => 'failed', 'messageid' => '<old>',
            'senttime' => 100, 'timecreated' => 500];
        $this->assertSame('bounced', tracker::student_state($user, $bounce, null));
        $user->email = 'corrected@example.test';
        $this->assertSame('corrected', tracker::student_state($user, $bounce, null));
        $invite = (object)['email' => $user->email, 'state' => 'accepted', 'messageid' => '<new>', 'timecreated' => 200];
        $this->assertSame('accepted', tracker::student_state($user, $bounce, $invite));
        $bounce->email = $user->email;
        $bounce->messageid = '<new>';
        $this->assertSame('bounced', tracker::student_state($user, $bounce, $invite));
    }

    public function test_report_filters_cohorts_and_does_not_call_unreported_mail_delivered(): void {
        $this->resetAfterTest();
        $one = $this->getDataGenerator()->create_cohort();
        $two = $this->getDataGenerator()->create_cohort();
        $a = $this->getDataGenerator()->create_user(['email' => 'student@example.test']);
        $b = $this->getDataGenerator()->create_user();
        cohort_add_member($one->id, $a->id);
        cohort_add_member($two->id, $b->id);
        tracker::record_bounce(dsn_parser::parse(self::message())[0], hash('sha256', 'report'), time());
        $this->assertSame(1, report::data($one->id, 'todo', 0)['todo']);
        $this->assertSame(0, report::data($two->id, 'todo', 0)['todo']);
        $this->assertSame('noreturn', report::data($two->id, 'all', 0)['rows'][0]['state']);
    }
}

/** In-memory wire fixture, no network or authentication. */
class test_mailbox_reader extends mailbox_client {
    public function __construct(string $reply) {
        $this->socket = fopen('php://temp', 'w+');
        fwrite($this->socket, $reply);
        rewind($this->socket);
    }
    public function reply(): array {
        return $this->read_reply('X1');
    }
}

/** Deterministic IMAP seam for testing incremental ingestion. */
class test_sync_client extends mailbox_client {
    public array $cursors = [];
    public function __construct(private string $raw) {
    }
    public function connect(string $username, string $password): int {
        return 42;
    }
    public function search(int $after): array {
        $this->cursors[] = $after;
        return $after < 6 ? [6] : [];
    }
    public function message(int $uid): array {
        return ['raw' => $this->raw, 'received' => time(), 'oversize' => false];
    }
}
