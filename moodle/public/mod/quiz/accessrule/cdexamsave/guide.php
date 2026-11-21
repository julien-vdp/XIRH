<?php
// XIRH Academy extension of CD ExamFocus. GNU GPL v3 or later.
require_once(__DIR__ . '/../../../../config.php');
$cmid = required_param('cmid', PARAM_INT);
$cm = get_coursemodule_from_id('quiz', $cmid, 0, false, MUST_EXIST);
$course = $DB->get_record('course', ['id' => $cm->course], '*', MUST_EXIST);
require_login($course, false, $cm);
$context = context_module::instance($cmid);
require_capability('quizaccess/cdexamsave:viewreport', $context);
$PAGE->set_url(new moodle_url('/mod/quiz/accessrule/cdexamsave/guide.php', ['cmid' => $cmid]));
$PAGE->set_context($context);
$PAGE->set_cm($cm);
$PAGE->set_course($course);
$PAGE->set_title(get_string('guidetitle', 'quizaccess_cdexamsave'));
$PAGE->set_heading(format_string($course->fullname));
$PAGE->requires->css(new moodle_url('/mod/quiz/accessrule/cdexamsave/styles.css'));
echo $OUTPUT->header();
echo html_writer::start_div('cdexamsave-report xa-exam-guide');
echo $OUTPUT->heading(get_string('guidetitle', 'quizaccess_cdexamsave'));
echo get_string('guidebody', 'quizaccess_cdexamsave');
echo html_writer::link(new moodle_url('/mod/quiz/view.php', ['id' => $cmid]), get_string('back'), ['class' => 'btn btn-primary']);
echo html_writer::end_div();
echo $OUTPUT->footer();
