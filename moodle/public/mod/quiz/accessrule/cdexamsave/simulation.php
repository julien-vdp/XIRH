<?php
// XIRH Academy extension. GNU GPL v3 or later.
require_once(__DIR__ . '/../../../../config.php');
$cmid = required_param('cmid', PARAM_INT);
$fullscreen = optional_param('fullscreen', 1, PARAM_BOOL);
$cm = get_coursemodule_from_id('quiz', $cmid, 0, false, MUST_EXIST);
$course = $DB->get_record('course', ['id' => $cm->course], '*', MUST_EXIST);
require_login($course, false, $cm);
$context = context_module::instance($cmid);
require_capability('quizaccess/cdexamsave:viewreport', $context);
$config = \quizaccess_cdexamsave\local\simulation::configuration($cmid, (bool)$fullscreen);
$url = new moodle_url('/mod/quiz/accessrule/cdexamsave/simulation.php', ['cmid' => $cmid, 'fullscreen' => $fullscreen]);
$PAGE->set_url($url);
$PAGE->set_context($context);
$PAGE->set_cm($cm);
$PAGE->set_course($course);
$PAGE->set_title(get_string('simulationtitle', 'quizaccess_cdexamsave'));
$PAGE->set_heading(format_string($course->fullname));
$PAGE->set_popup_notification_allowed(false);
$PAGE->add_body_class('xa-exam-loading');
$PAGE->requires->css(new moodle_url('/mod/quiz/accessrule/cdexamsave/styles.css'));
$PAGE->requires->data_for_js('M.quizaccess_cdexamsaveConfig', $config);
$PAGE->requires->js_call_amd('quizaccess_cdexamsave/monitor', 'init');
echo $OUTPUT->header();
echo html_writer::start_div('xa-exam-simulation');
echo $OUTPUT->heading(get_string('simulationtitle', 'quizaccess_cdexamsave'));
echo html_writer::div(get_string('simulationnotice', 'quizaccess_cdexamsave'), 'alert alert-info');
echo html_writer::tag('p', get_string('simulationinstructions', 'quizaccess_cdexamsave'));
if (!$config['requireFullscreen']) {
    echo html_writer::div(get_string('simulationnofullscreen', 'quizaccess_cdexamsave'), 'alert alert-warning');
}
echo html_writer::tag('p', get_string('simulationreset', 'quizaccess_cdexamsave'));
echo html_writer::link($url, get_string('simulationrestart', 'quizaccess_cdexamsave'), ['class' => 'btn btn-secondary me-2']);
echo html_writer::link(new moodle_url('/mod/quiz/view.php', ['id' => $cmid]), get_string('backtoquiz', 'quizaccess_cdexamsave'),
    ['class' => 'btn btn-secondary']);
echo html_writer::end_div();
echo $OUTPUT->footer();
