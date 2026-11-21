<?php
// XIRH Academy extension of CD ExamFocus. GNU GPL v3 or later.
namespace quizaccess_cdexamsave\local;

defined('MOODLE_INTERNAL') || die();

/** Immutable attempt policies and server-owned penalty totals. */
class penalty_service {
    public const FIELDS = ['requirefullscreen', 'penaltiesenabled', 'penaltyfirst', 'penaltysecond', 'penaltylater'];

    /** Freeze the exam policy when an attempt first starts monitoring. */
    public static function ensure_attempt(\stdClass $attempt): \stdClass {
        global $DB;
        $record = $DB->get_record('quizaccess_cdexamsave_grade', ['attemptid' => $attempt->id]);
        if ($record) {
            return $record;
        }
        $settings = $DB->get_record('quizaccess_cdexamsave', ['quizid' => $attempt->quiz], '*', MUST_EXIST);
        $record = (object) [
            'quizid' => $attempt->quiz, 'attemptid' => $attempt->id, 'userid' => $attempt->userid,
            'incidentcount' => 0, 'penalty' => 0, 'timecreated' => time(), 'timemodified' => time(),
            'graceperiodms' => $settings->graceperiodms,
        ];
        foreach (self::FIELDS as $field) {
            $record->$field = $settings->$field;
        }
        $record->id = $DB->insert_record('quizaccess_cdexamsave_grade', $record);
        return $record;
    }

    /** Penalties are positive deductions expressed in the quiz's grade units. */
    public static function deduction(int $ordinal, \stdClass $policy): float {
        if (empty($policy->penaltiesenabled)) {
            return 0.0;
        }
        $field = $ordinal === 1 ? 'penaltyfirst' : ($ordinal === 2 ? 'penaltysecond' : 'penaltylater');
        return max(0.0, (float) $policy->$field);
    }

    /** Called once for a newly inserted UUID, inside the collector lock/transaction. */
    public static function add_incident(\stdClass $attempt, \stdClass $event): void {
        global $DB;
        $ledger = self::ensure_attempt($attempt);
        $event->ordinal = ++$ledger->incidentcount;
        $event->penalty = self::deduction($event->ordinal, $ledger);
        $DB->update_record('quizaccess_cdexamsave_evt', $event);
        $ledger->penalty += $event->penalty;
        $ledger->timemodified = time();
        $DB->update_record('quizaccess_cdexamsave_grade', $ledger);
    }

    /** Return counters without exposing question grades or answers. */
    public static function summary(int $attemptid): array {
        global $DB;
        $ledger = $DB->get_record('quizaccess_cdexamsave_grade', ['attemptid' => $attemptid]);
        return ['incidentcount' => $ledger ? (int) $ledger->incidentcount : 0,
            'penalty' => $ledger ? (float) $ledger->penalty : 0.0];
    }

    /** Apply Moodle's attempt aggregation to individually penalised attempt marks. */
    public static function aggregate(array $marks, int $method): ?float {
        if (!$marks) {
            return null;
        }
        if ($method === (int) QUIZ_ATTEMPTFIRST) {
            return reset($marks);
        }
        if ($method === (int) QUIZ_ATTEMPTLAST) {
            return end($marks);
        }
        $marks = array_filter($marks, static fn($mark) => $mark !== null);
        if (!$marks) {
            return null;
        }
        return $method === (int) QUIZ_GRADEAVERAGE ? array_sum($marks) / count($marks) : max($marks);
    }

    /** Recompute from original question marks, never from an already penalised grade. */
    public static function sync_grades(int $quizid, int $userid): void {
        global $CFG, $DB;
        static $running = [];
        $key = $quizid . ':' . $userid;
        if (!empty($running[$key]) || !$DB->record_exists('quizaccess_cdexamsave_grade',
                ['quizid' => $quizid, 'userid' => $userid])) {
            return;
        }
        $running[$key] = true;
        try {
            require_once($CFG->libdir . '/gradelib.php');
            $quiz = $DB->get_record('quiz', ['id' => $quizid]);
            if (!$quiz || $quiz->grade <= 0 || $quiz->sumgrades <= 0) {
                return;
            }
            $item = \grade_item::fetch(['itemtype' => 'mod', 'itemmodule' => 'quiz',
                'iteminstance' => $quizid, 'itemnumber' => 0]);
            if (!$item || $item->is_locked()) {
                return;
            }
            $grade = \grade_grade::fetch(['itemid' => $item->id, 'userid' => $userid]);
            if ($grade && ($grade->is_locked() || $grade->is_overridden())) {
                return; // A deliberate teacher override always takes precedence.
            }
            $attempts = $DB->get_records('quiz_attempts',
                ['quiz' => $quizid, 'userid' => $userid, 'preview' => 0, 'state' => 'finished'], 'attempt ASC');
            $ledgers = $DB->get_records('quizaccess_cdexamsave_grade', ['quizid' => $quizid, 'userid' => $userid]);
            $penalties = [];
            foreach ($ledgers as $ledger) {
                $penalties[$ledger->attemptid] = (float) $ledger->penalty;
            }
            $marks = [];
            foreach ($attempts as $attempt) {
                $marks[] = $attempt->sumgrades === null ? null : max(0.0,
                    min((float) $quiz->grade, (float) $attempt->sumgrades * $quiz->grade / $quiz->sumgrades
                        - ($penalties[$attempt->id] ?? 0.0)));
            }
            $target = self::aggregate($marks, (int) $quiz->grademethod);
            if ($target === null) {
                return;
            }
            // quiz_grades is Moodle's aggregate cache; original attempt/question marks stay intact.
            $cached = $DB->get_record('quiz_grades', ['quiz' => $quizid, 'userid' => $userid]);
            if ($cached && abs((float) $cached->grade - $target) > 0.00001) {
                $DB->update_record('quiz_grades', (object) ['id' => $cached->id,
                    'grade' => $target, 'timemodified' => time()]);
            }
            if (!$grade || $grade->rawgrade === null || abs((float) $grade->rawgrade - $target) > 0.00001) {
                $item->update_raw_grade($userid, $target, 'quizaccess_cdexamsave');
            }
        } finally {
            unset($running[$key]);
        }
    }

    /** Cancel a technical incident without renumbering subsequent departures. */
    public static function waive(int $eventid, string $reason): void {
        global $DB, $USER;
        $event = $DB->get_record('quizaccess_cdexamsave_evt', ['id' => $eventid], '*', MUST_EXIST);
        $cm = get_coursemodule_from_instance('quiz', $event->quizid, 0, false, MUST_EXIST);
        require_capability('quizaccess/cdexamsave:managepenalties', \context_module::instance($cm->id));
        $allowed = report_service::get_allowed_userids($cm, \context_module::instance($cm->id), 0);
        if ($allowed !== null && !in_array((int) $event->userid, $allowed, true)) {
            throw new \required_capability_exception(\context_module::instance($cm->id),
                'moodle/site:accessallgroups', 'nopermissions', '');
        }
        if (trim($reason) === '') {
            throw new \moodle_exception('waivereasonrequired', 'quizaccess_cdexamsave');
        }
        $lock = \core\lock\lock_config::get_lock_factory('quizaccess_cdexamsave')->get_lock('attempt:' . $event->attemptid, 10);
        if (!$lock) {
            throw new \moodle_exception('locktimeout');
        }
        try {
            $transaction = $DB->start_delegated_transaction();
            $event = $DB->get_record('quizaccess_cdexamsave_evt', ['id' => $eventid], '*', MUST_EXIST);
            if (!$event->timewaived) {
                $event->waivedby = $USER->id;
                $event->timewaived = time();
                $event->waivereason = \core_text::substr(trim($reason), 0, 1000);
                $DB->update_record('quizaccess_cdexamsave_evt', $event);
                $ledger = $DB->get_record('quizaccess_cdexamsave_grade', ['attemptid' => $event->attemptid], '*', MUST_EXIST);
                $ledger->penalty = max(0, $ledger->penalty - $event->penalty);
                $ledger->timemodified = time();
                $DB->update_record('quizaccess_cdexamsave_grade', $ledger);
            }
            $transaction->allow_commit();
        } finally {
            $lock->release();
        }
        self::sync_grades((int) $event->quizid, (int) $event->userid);
    }
}
