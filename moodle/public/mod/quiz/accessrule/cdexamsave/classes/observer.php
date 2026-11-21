<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

namespace quizaccess_cdexamsave;

/**
 * Quiz event observers.
 *
 * @package    quizaccess_cdexamsave
 * @copyright  2026 Carlos Díaz Bueno
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class observer {
    /** Grade events can be needed even when the gradebook number itself did not change. */
    public static function attempt_grade_updated(\core\event\base $event): void {
        global $DB;
        $id = $event->other['attemptid'] ?? $event->objectid;
        $attempt = $DB->get_record('quiz_attempts', ['id' => $id]);
        if ($attempt) {
            \quizaccess_cdexamsave\local\penalty_service::sync_grades((int) $attempt->quiz, (int) $attempt->userid);
        }
    }

    /** Reconcile marks after a changed grade maximum or aggregation method. */
    public static function quiz_updated(\core\event\base $event): void {
        global $DB;
        if ($event instanceof \core\event\course_module_updated) {
            if (($event->other['modulename'] ?? '') !== 'quiz') {
                return;
            }
            $quizid = (int) $event->other['instanceid'];
        } else {
            $quizid = (int) $event->objectid;
        }
        foreach ($DB->get_fieldset_select('quizaccess_cdexamsave_grade', 'DISTINCT userid', 'quizid = ?', [$quizid]) as $userid) {
            \quizaccess_cdexamsave\local\penalty_service::sync_grades($quizid, (int) $userid);
        }
    }
    /** Reapply deductions after question regrading, essay marking or a gradebook refresh. */
    public static function grade_updated(\core\event\user_graded $event): void {
        global $DB;
        $item = $DB->get_record('grade_items', ['id' => $event->other['itemid']]);
        if ($item && $item->itemtype === 'mod' && $item->itemmodule === 'quiz' && (int) $item->itemnumber === 0) {
            \quizaccess_cdexamsave\local\penalty_service::sync_grades((int) $item->iteminstance, (int) $event->relateduserid);
        }
    }

    /**
     * Mark monitoring inactive and close any open incident.
     *
     * @param \core\event\base $event Quiz attempt event.
     * @return void
     */
    public static function attempt_finished(\core\event\base $event): void {
        global $DB;

        $attemptid = (int) $event->objectid;
        $now = time();
        \quizaccess_cdexamsave\local\incident_service::close_open_incidents($attemptid, $now);
        $attempt = $DB->get_record('quiz_attempts', ['id' => $attemptid]);
        if ($attempt) {
            \quizaccess_cdexamsave\local\penalty_service::sync_grades((int) $attempt->quiz, (int) $attempt->userid);
        }
        $session = $DB->get_record('quizaccess_cdexamsave_sess', ['attemptid' => $attemptid]);
        if ($session) {
            $session->active = 0;
            $session->focuslost = 0;
            $session->lostsince = 0;
            $session->timemodified = $now;
            $DB->update_record('quizaccess_cdexamsave_sess', $session);
        }
    }

    /**
     * Remove monitoring data when its quiz attempt is deleted.
     *
     * @param \core\event\base $event Attempt-deleted event.
     * @return void
     */
    public static function attempt_deleted(\core\event\base $event): void {
        global $DB;

        $attemptid = (int) $event->objectid;
        $ledger = $DB->get_record('quizaccess_cdexamsave_grade', ['attemptid' => $attemptid]);
        $DB->delete_records('quizaccess_cdexamsave_grade', ['attemptid' => $attemptid]);
        if ($ledger) {
            \quizaccess_cdexamsave\local\penalty_service::sync_grades((int) $ledger->quizid, (int) $ledger->userid);
        }
        $DB->delete_records('quizaccess_cdexamsave_evt', ['attemptid' => $attemptid]);
        $DB->delete_records('quizaccess_cdexamsave_sess', ['attemptid' => $attemptid]);
    }
}
