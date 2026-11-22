<?php
// XIRH Academy extension. GNU GPL v3 or later.
namespace quizaccess_cdexamsave\local;
defined('MOODLE_INTERNAL') || die();

/** Read-only configuration for a teacher's browser-only rehearsal. */
final class simulation {
    public static function configuration(int $cmid, bool $fullscreen = true): array {
        global $DB;
        $cm = get_coursemodule_from_id('quiz', $cmid, 0, false, MUST_EXIST);
        require_capability('quizaccess/cdexamsave:viewreport', \context_module::instance($cmid));
        $quiz = $DB->get_record('quiz', ['id' => $cm->instance], '*', MUST_EXIST);
        $settings = $DB->get_record('quizaccess_cdexamsave', ['quizid' => $quiz->id]);
        $component = 'quizaccess_cdexamsave';
        $strings = [];
        foreach (['gateTitle', 'gateText', 'start', 'resume', 'warningTitle', 'warningText', 'statusActive',
                'statusOffline', 'statusPending', 'counter', 'totalPenalty', 'policy', 'fullscreenUnavailable',
                'syncRequired', 'technicalError', 'noPenalty', 'deductionNotice', 'warningOnly', 'warningRate',
                'close', 'statusSending'] as $key) {
            $strings[$key] = get_string('ui_' . strtolower($key), $component);
        }
        foreach (['gateTitle', 'gateText', 'start', 'resume', 'statusActive', 'counter', 'totalPenalty',
                'deductionNotice', 'warningOnly', 'statusSending', 'mode', 'simulateLoss', 'withoutFullscreen'] as $key) {
            $strings[$key] = get_string('simulation_' . strtolower($key), $component);
        }
        return [
            'simulation' => true,
            'attemptId' => 0, 'cmId' => $cmid,
            'gracePeriodMs' => (int)($settings->graceperiodms ?? 0),
            'heartbeatMs' => 10000, 'warnStudent' => true,
            'requireFullscreen' => $fullscreen && !empty($settings->requirefullscreen),
            'penaltiesEnabled' => !empty($settings->penaltiesenabled),
            'rates' => [(float)($settings->penaltyfirst ?? 0), (float)($settings->penaltysecond ?? 2),
                (float)($settings->penaltylater ?? 3)],
            'gradeMax' => (float)$quiz->grade, 'strings' => $strings,
            'incidentcount' => 0, 'penalty' => 0,
            'withoutFullscreenUrl' => (new \moodle_url('/mod/quiz/accessrule/cdexamsave/simulation.php',
                ['cmid' => $cmid, 'fullscreen' => 0]))->out(false),
        ];
    }
}
