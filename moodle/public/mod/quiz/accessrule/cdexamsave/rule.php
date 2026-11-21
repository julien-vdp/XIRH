<?php
// CD ExamFocus © 2026 Carlos Díaz Bueno; XIRH Academy extension. GNU GPL v3 or later.
use quizaccess_cdexamsave\local\penalty_service;

/** Browser monitoring, fullscreen and configurable deductions for Moodle quizzes. */
class quizaccess_cdexamsave extends \mod_quiz\local\access_rule_base {
    public static function make($quizobj, $timenow, $canignoretimelimits) {
        global $DB, $USER;
        $attemptid = optional_param('attempt', 0, PARAM_INT);
        $continuing = $attemptid && $DB->record_exists('quizaccess_cdexamsave_grade',
            ['attemptid' => $attemptid, 'quizid' => $quizobj->get_quizid(), 'userid' => $USER->id]);
        return empty($quizobj->get_quiz()->cdexamsaveenabled) && !$continuing ? null : new self($quizobj, $timenow);
    }

    public static function add_settings_form_fields($quizform, $mform) {
        $component = 'quizaccess_cdexamsave';
        $mform->addElement('header', 'cdexamsaveheader', get_string('formheader', $component));
        $mform->addElement('static', 'cdexamsaveintro', '', get_string('settingsintro', $component));
        foreach (['enabled' => 0, 'requirefullscreen' => 1, 'penaltiesenabled' => 1, 'warnstudent' => 1] as $field => $default) {
            $name = 'cdexamsave' . $field;
            $mform->addElement('selectyesno', $name, get_string($field, $component));
            $mform->setDefault($name, $default);
            $mform->addHelpButton($name, $field, $component);
            if ($field !== 'enabled') {
                $mform->disabledIf($name, 'cdexamsaveenabled', 'eq', 0);
            }
        }
        foreach (['penaltyfirst' => 0, 'penaltysecond' => 2, 'penaltylater' => 3] as $field => $default) {
            $name = 'cdexamsave' . $field;
            $mform->addElement('text', $name, get_string($field, $component), ['size' => 6, 'inputmode' => 'decimal']);
            $mform->setType($name, PARAM_RAW_TRIMMED);
            $mform->setDefault($name, $default);
            $mform->disabledIf($name, 'cdexamsaveenabled', 'eq', 0);
            $mform->disabledIf($name, 'cdexamsavepenaltiesenabled', 'eq', 0);
        }
        $mform->addElement('static', 'cdexamsaveunits', '', get_string('penaltyunits', $component));
        $options = [];
        foreach ([0, 500, 1000, 2000, 3000] as $ms) {
            $options[$ms] = get_string($ms === 0 ? 'immediate' : 'tolerancems', $component, $ms);
        }
        $mform->addElement('select', 'cdexamsavegraceperiodms', get_string('graceperiod', $component), $options);
        $mform->setDefault('cdexamsavegraceperiodms', 0);
        $mform->addHelpButton('cdexamsavegraceperiodms', 'graceperiod', $component);
        $mform->disabledIf('cdexamsavegraceperiodms', 'cdexamsaveenabled', 'eq', 0);
    }

    public static function validate_settings_form_fields($errors, $data, $files, $quizform) {
        if (empty($data['cdexamsaveenabled'])) {
            return $errors;
        }
        if (!in_array((int) ($data['cdexamsavegraceperiodms'] ?? -1), [0, 500, 1000, 2000, 3000], true)) {
            $errors['cdexamsavegraceperiodms'] = get_string('invalidgraceperiod', 'quizaccess_cdexamsave');
        }
        foreach (['penaltyfirst', 'penaltysecond', 'penaltylater'] as $field) {
            $value = trim((string) ($data['cdexamsave' . $field] ?? '0'));
            if (!preg_match('/^\d{1,5}([.,]\d{1,2})?$/D', $value) || (float) str_replace(',', '.', $value) > 10000) {
                $errors['cdexamsave' . $field] = get_string('invalidpenalty', 'quizaccess_cdexamsave');
            }
        }
        return $errors;
    }

    public static function save_settings($quiz) {
        global $DB;
        $record = $DB->get_record('quizaccess_cdexamsave', ['quizid' => $quiz->id]) ?: (object) [
            'quizid' => $quiz->id, 'timecreated' => time(),
        ];
        $record->enabled = empty($quiz->cdexamsaveenabled) ? 0 : 1;
        $record->warnstudent = empty($quiz->cdexamsavewarnstudent) ? 0 : 1;
        $record->graceperiodms = (int) ($quiz->cdexamsavegraceperiodms ?? $record->graceperiodms ?? 0);
        $defaults = ['requirefullscreen' => 1, 'penaltiesenabled' => 1, 'penaltyfirst' => 0,
            'penaltysecond' => 2, 'penaltylater' => 3];
        foreach (penalty_service::FIELDS as $field) {
            $value = $quiz->{'cdexamsave' . $field} ?? $record->$field ?? $defaults[$field];
            $record->$field = str_starts_with($field, 'penalty') ? (float) str_replace(',', '.', (string) $value) : (int) !empty($value);
        }
        if ($record->penaltiesenabled) {
            $record->warnstudent = 1;
        }
        $record->timemodified = time();
        if (empty($record->id)) {
            $DB->insert_record('quizaccess_cdexamsave', $record);
        } else {
            $DB->update_record('quizaccess_cdexamsave', $record);
        }
    }

    public static function delete_settings($quiz) {
        global $DB;
        foreach (['quizaccess_cdexamsave', 'quizaccess_cdexamsave_evt', 'quizaccess_cdexamsave_sess',
                'quizaccess_cdexamsave_grade'] as $table) {
            $DB->delete_records($table, ['quizid' => $quiz->id]);
        }
    }

    public static function get_settings_sql($quizid) {
        $fields = array_merge(['enabled', 'warnstudent', 'graceperiodms'], penalty_service::FIELDS);
        return [implode(', ', array_map(static fn($f) => 'cds.' . $f . ' AS cdexamsave' . $f, $fields)),
            'LEFT JOIN {quizaccess_cdexamsave} cds ON cds.quizid = quiz.id', []];
    }

    public function setup_attempt_page($page) {
        global $DB, $USER;
        $attemptid = optional_param('attempt', 0, PARAM_INT);
        $attempt = $DB->get_record('quiz_attempts', ['id' => $attemptid, 'quiz' => $this->quiz->id,
            'userid' => $USER->id, 'preview' => 0, 'state' => 'inprogress']);
        if (!$attempt) {
            return;
        }
        $lock = \core\lock\lock_config::get_lock_factory('quizaccess_cdexamsave')->get_lock('attempt:' . $attemptid, 10);
        if (!$lock) {
            throw new moodle_exception('locktimeout');
        }
        try {
            $policy = penalty_service::ensure_attempt($attempt);
        } finally {
            $lock->release();
        }
        $cm = get_coursemodule_from_instance('quiz', $this->quiz->id, $this->quiz->course, false, MUST_EXIST);
        $keys = ['gateTitle', 'gateText', 'start', 'resume', 'warningTitle', 'warningText', 'statusActive',
            'statusOffline', 'statusPending', 'counter', 'totalPenalty', 'policy', 'fullscreenUnavailable',
            'syncRequired', 'technicalError', 'noPenalty', 'deductionNotice', 'warningOnly', 'warningRate', 'close', 'statusSending'];
        $strings = [];
        foreach ($keys as $key) {
            $strings[$key] = get_string('ui_' . strtolower($key), 'quizaccess_cdexamsave');
        }
        $page->add_body_class('xa-exam-loading');
        $page->requires->css(new moodle_url('/mod/quiz/accessrule/cdexamsave/styles.css'));
        $page->requires->data_for_js('M.quizaccess_cdexamsaveConfig', [
            'attemptId' => (int) $attemptid, 'cmId' => (int) $cm->id,
            'gracePeriodMs' => (int) $policy->graceperiodms,
            'heartbeatMs' => max(5, (int) get_config('quizaccess_cdexamsave', 'heartbeatinterval')) * 1000,
            'warnStudent' => (bool) $this->quiz->cdexamsavewarnstudent,
            'requireFullscreen' => (bool) $policy->requirefullscreen,
            'penaltiesEnabled' => (bool) $policy->penaltiesenabled,
            'rates' => [(float) $policy->penaltyfirst, (float) $policy->penaltysecond, (float) $policy->penaltylater],
            'gradeMax' => (float) $this->quiz->grade, 'strings' => $strings,
        ] + penalty_service::summary($attemptid));
        $page->requires->js_call_amd('quizaccess_cdexamsave/monitor', 'init');
        $page->set_popup_notification_allowed(false);
    }

    public function description() {
        $cm = get_coursemodule_from_instance('quiz', $this->quiz->id, $this->quiz->course, false, MUST_EXIST);
        $messages = [get_string('monitoringnotice', 'quizaccess_cdexamsave')];
        if (!empty($this->quiz->cdexamsavepenaltiesenabled)) {
            $messages[] = get_string('examnotice', 'quizaccess_cdexamsave', (object) [
                'first' => format_float($this->quiz->cdexamsavepenaltyfirst, 2),
                'second' => format_float($this->quiz->cdexamsavepenaltysecond, 2),
                'later' => format_float($this->quiz->cdexamsavepenaltylater, 2),
                'max' => format_float($this->quiz->grade, 2),
            ]);
        }
        if (has_capability('quizaccess/cdexamsave:viewreport', context_module::instance($cm->id))) {
            foreach (['report.php' => 'openlivereport', 'history.php' => 'historytitle', 'guide.php' => 'guidetitle'] as $path => $key) {
                $messages[] = html_writer::link(new moodle_url('/mod/quiz/accessrule/cdexamsave/' . $path,
                    ['cmid' => $cm->id]), get_string($key, 'quizaccess_cdexamsave'), ['class' => 'btn btn-secondary btn-sm']);
            }
        }
        return $messages;
    }
}
