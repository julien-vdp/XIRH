<?php
require_once(__DIR__ . '/../../config.php');
require_once($CFG->libdir . '/adminlib.php');
require_login();
require_capability('local/xirhmail:manage', context_system::instance());
$cohortid = optional_param('cohortid', 0, PARAM_INT);
$filter = optional_param('filter', 'todo', PARAM_ALPHA);
$page = max(0, optional_param('page', 0, PARAM_INT));
$filter = $filter === 'all' ? 'all' : 'todo';
$url = new moodle_url('/local/xirhmail/index.php', ['cohortid' => $cohortid, 'filter' => $filter]);
admin_externalpage_setup('local_xirhmail', '', null, $url);
$PAGE->set_title(get_string('pluginname', 'local_xirhmail'));
$PAGE->set_heading(get_string('pluginname', 'local_xirhmail'));
$PAGE->requires->css('/local/xirhmail/styles.css');
if (data_submitted() && optional_param('action', '', PARAM_ALPHA) === 'sync') {
    require_sesskey();
    try {
        $result = \local_xirhmail\tracker::sync();
        redirect($url, get_string('syncdone', 'local_xirhmail', $result['added']), null,
            \core\output\notification::NOTIFY_SUCCESS);
    } catch (moodle_exception $e) {
        redirect($url, $e->getMessage(), null, \core\output\notification::NOTIFY_ERROR);
    }
}
$data = \local_xirhmail\report::data($cohortid, $filter, $page);
$cohorts = $DB->get_records('cohort', [], 'name', 'id,name');
$data['cohorts'] = array_values(array_map(static fn($cohort) => ['id' => $cohort->id,
    'name' => format_string($cohort->name, true, ['context' => context_system::instance()]),
    'selected' => (int)$cohort->id === $cohortid], $cohorts));
$data += ['cohortid' => $cohortid, 'allcohorts' => $cohortid === 0,
    'showall' => $filter === 'all', 'showtodo' => $filter === 'todo', 'actionurl' => $url->out(false),
    'sesskey' => sesskey(), 'enabled' => (bool)get_config('local_xirhmail', 'enabled'),
    'syncerror' => (bool)get_config('local_xirhmail', 'syncerror'),
    'oversize' => (int)get_config('local_xirhmail', 'oversize'),
    'settingsurl' => (new moodle_url('/admin/settings.php', ['section' => 'local_xirhmail_settings']))->out(false),
    'hasunmatched' => !empty($data['unmatched']), 'hasrows' => !empty($data['rows']),
    'lastsync' => get_config('local_xirhmail', 'lastsync') ?
        userdate(get_config('local_xirhmail', 'lastsync'), get_string('strftimedatetimeshort')) :
        get_string('neversynced', 'local_xirhmail')];
echo $OUTPUT->header();
echo $OUTPUT->render_from_template('local_xirhmail/report', $data);
echo $OUTPUT->paging_bar($data['filteredcount'], $data['page'], 50, $url);
echo $OUTPUT->footer();
