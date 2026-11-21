<?php
// XIRH Academy extension of CD ExamFocus. GNU GPL v3 or later.
require_once(__DIR__ . '/../../../../config.php');

use quizaccess_cdexamsave\local\penalty_service;
use quizaccess_cdexamsave\local\report_service;

$cmid = required_param('cmid', PARAM_INT);
$cm = get_coursemodule_from_id('quiz', $cmid, 0, false, MUST_EXIST);
$course = $DB->get_record('course', ['id' => $cm->course], '*', MUST_EXIST);
$quiz = $DB->get_record('quiz', ['id' => $cm->instance], '*', MUST_EXIST);
require_login($course, false, $cm);
$context = context_module::instance($cm->id);
require_capability('quizaccess/cdexamsave:viewreport', $context);
$url = new moodle_url('/mod/quiz/accessrule/cdexamsave/history.php', ['cmid' => $cmid]);
$PAGE->set_url($url);
$PAGE->set_context($context);
$PAGE->set_cm($cm);
$PAGE->set_course($course);
$PAGE->set_pagelayout('report');
$PAGE->set_title(get_string('historytitle', 'quizaccess_cdexamsave'));
$PAGE->set_heading(format_string($course->fullname));
$PAGE->requires->css(new moodle_url('/mod/quiz/accessrule/cdexamsave/styles.css'));
$canmanage = has_capability('quizaccess/cdexamsave:managepenalties', $context);
if (data_submitted() && optional_param('waive', 0, PARAM_INT)) {
    require_sesskey();
    require_capability('quizaccess/cdexamsave:managepenalties', $context);
    $eventid = required_param('waive', PARAM_INT);
    $event = $DB->get_record('quizaccess_cdexamsave_evt', ['id' => $eventid, 'quizid' => $quiz->id], '*', MUST_EXIST);
    penalty_service::waive($event->id, required_param('reason', PARAM_TEXT));
    redirect($url, get_string('waivesaved', 'quizaccess_cdexamsave'), null, \core\output\notification::NOTIFY_SUCCESS);
}
$allowed = report_service::get_allowed_userids($cm, $context, 0);
$params = ['quizid' => $quiz->id];
$filter = '';
if ($allowed !== null) {
    if ($allowed) {
        [$insql, $inparams] = $DB->get_in_or_equal($allowed, SQL_PARAMS_NAMED, 'historyuser');
        $filter = ' AND g.userid ' . $insql;
        $params += $inparams;
    } else {
        $filter = ' AND 1 = 0';
    }
}
$page = max(0, optional_param('page', 0, PARAM_INT));
$perpage = 30;
$total = $DB->count_records_sql('SELECT COUNT(g.id) FROM {quizaccess_cdexamsave_grade} g WHERE g.quizid = :quizid' . $filter, $params);
$rows = $DB->get_records_sql('SELECT g.*, qa.attempt, qa.state, qa.sumgrades,
        u.firstname, u.lastname, u.firstnamephonetic, u.lastnamephonetic, u.middlename, u.alternatename
    FROM {quizaccess_cdexamsave_grade} g
    JOIN {quiz_attempts} qa ON qa.id = g.attemptid
    JOIN {user} u ON u.id = g.userid
    WHERE g.quizid = :quizid ' . $filter . ' ORDER BY qa.timestart DESC, g.id DESC', $params, $page * $perpage, $perpage);
echo $OUTPUT->header();
echo html_writer::start_div('cdexamsave-report xa-exam-history');
echo $OUTPUT->heading(get_string('historytitle', 'quizaccess_cdexamsave') . ' · ' . format_string($quiz->name));
echo html_writer::tag('p', get_string('historyintro', 'quizaccess_cdexamsave'));
foreach (['report.php' => 'openlivereport', 'guide.php' => 'guidetitle'] as $path => $key) {
    echo html_writer::link(new moodle_url('/mod/quiz/accessrule/cdexamsave/' . $path, ['cmid' => $cmid]),
        get_string($key, 'quizaccess_cdexamsave'), ['class' => 'btn btn-secondary me-2 mb-3']);
}
if (!$rows) {
    echo $OUTPUT->notification(get_string('noincidents', 'quizaccess_cdexamsave'), 'info');
}
foreach ($rows as $row) {
    echo html_writer::start_tag('section', ['class' => 'xa-exam-attempt']);
    echo html_writer::tag('h3', s(fullname($row)) . ' · ' . get_string('attempt', 'quizaccess_cdexamsave') . ' ' . $row->attempt);
    $raw = $row->sumgrades === null || !$quiz->sumgrades ? null : $row->sumgrades * $quiz->grade / $quiz->sumgrades;
    $mark = $raw === null ? '—' : format_float(max(0, $raw - $row->penalty), 2) . ' / ' . format_float($quiz->grade, 2);
    echo html_writer::div(s(get_string('state' . $row->state, 'quiz')) . ' · ' .
        get_string('incidentcount', 'quizaccess_cdexamsave') . ' : ' . $row->incidentcount . ' · ' .
        get_string('deduction', 'quizaccess_cdexamsave') . ' : −' . format_float($row->penalty, 2) . ' · ' .
        get_string('adjustedmark', 'quizaccess_cdexamsave') . ' : ' . $mark, 'xa-exam-attempt-summary');
    $events = $DB->get_records('quizaccess_cdexamsave_evt', ['attemptid' => $row->attemptid], 'id ASC');
    foreach ($events as $event) {
        echo html_writer::start_div('xa-exam-incident');
        echo html_writer::tag('p', '#' . $event->ordinal . ' · ' . s(userdate($event->timestart)) . ' · ' .
            get_string('reason_' . $event->reason, 'quizaccess_cdexamsave') . ' · −' . format_float($event->penalty, 2));
        if ($event->timewaived) {
            echo html_writer::div(get_string('waived', 'quizaccess_cdexamsave') . ' · ' . s($event->waivereason), 'alert alert-info');
        } else if ($canmanage) {
            echo html_writer::start_tag('form', ['method' => 'post', 'action' => $url, 'class' => 'xa-exam-waive-form']);
            foreach (['sesskey' => sesskey(), 'waive' => $event->id] as $name => $value) {
                echo html_writer::empty_tag('input', ['type' => 'hidden', 'name' => $name, 'value' => $value]);
            }
            $id = 'waive-reason-' . $event->id;
            echo html_writer::tag('label', get_string('waivereason', 'quizaccess_cdexamsave'), ['for' => $id]);
            echo html_writer::empty_tag('input', ['name' => 'reason', 'id' => $id, 'required' => 'required',
                'maxlength' => 1000, 'class' => 'form-control']);
            echo html_writer::tag('button', get_string('waive', 'quizaccess_cdexamsave'),
                ['type' => 'submit', 'class' => 'btn btn-secondary']);
            echo html_writer::end_tag('form');
        }
        echo html_writer::end_div();
    }
    echo html_writer::end_tag('section');
}
echo $OUTPUT->paging_bar($total, $page, $perpage, $url);
echo html_writer::end_div();
echo $OUTPUT->footer();
