<?php
require_once(__DIR__ . '/../../config.php');
require_once($CFG->libdir . '/adminlib.php');
require_login();
require_capability('local/xirhmail:manage', context_system::instance());
$userid = required_param('userid', PARAM_INT);
$cohortid = optional_param('cohortid', 0, PARAM_INT);
$back = new moodle_url('/local/xirhmail/index.php', ['cohortid' => $cohortid]);
admin_externalpage_setup('local_xirhmail', '', null,
    new moodle_url('/local/xirhmail/invite.php', ['userid' => $userid, 'cohortid' => $cohortid]));
$fields = 'id,username,email,auth,deleted,suspended,emailstop,' . implode(',', \core_user\fields::get_name_fields());
$student = $DB->get_record('user', ['id' => $userid], $fields, MUST_EXIST);
if (isguestuser($student) || !\local_xirhmail\tracker::eligible($student)) {
    throw new moodle_exception('sendunavailable', 'local_xirhmail');
}
if (data_submitted()) {
    require_sesskey();
    $nonce = required_param('nonce', PARAM_ALPHANUM);
    $request = $SESSION->xirhmailrequests[$nonce] ?? null;
    if (!$request || $request['userid'] !== $userid || $request['created'] < time() - 1800) {
        throw new moodle_exception('invalidrequest', 'error');
    }
    try {
        $result = \local_xirhmail\tracker::send_invitation($userid, (int)$USER->id, hash('sha256', $nonce), $request['email']);
        $success = $result->state === 'accepted';
        redirect($back, get_string($success ? 'invitesent' : 'inviteuncertain', 'local_xirhmail'), null,
            $success ? \core\output\notification::NOTIFY_SUCCESS : \core\output\notification::NOTIFY_WARNING);
    } catch (moodle_exception $e) {
        redirect($back, $e->getMessage(), null, \core\output\notification::NOTIFY_ERROR);
    }
}
$SESSION->xirhmailrequests = array_filter($SESSION->xirhmailrequests ?? [],
    static fn($r) => $r['created'] >= time() - 1800);
$SESSION->xirhmailrequests = array_slice($SESSION->xirhmailrequests, -29, null, true);
$nonce = bin2hex(random_bytes(24));
$SESSION->xirhmailrequests[$nonce] = ['userid' => $userid, 'email' => $student->email, 'created' => time()];
$PAGE->requires->css('/local/xirhmail/styles.css');
$PAGE->set_title(get_string('resend', 'local_xirhmail'));
$PAGE->set_heading(get_string('resend', 'local_xirhmail'));
echo $OUTPUT->header();
echo $OUTPUT->render_from_template('local_xirhmail/preview', [
    'name' => fullname($student), 'email' => $student->email,
    'subject' => get_string('invitesubject', 'local_xirhmail'),
    'html' => \local_xirhmail\tracker::invitation_html($student),
    'backurl' => $back->out(false), 'sesskey' => sesskey(), 'nonce' => $nonce,
    'userid' => $userid, 'cohortid' => $cohortid,
]);
echo $OUTPUT->footer();
