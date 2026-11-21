<?php
// XIRH Academy extension. GNU GPL v3 or later.
namespace quizaccess_cdexamsave;

use quizaccess_cdexamsave\local\incident_service;
use quizaccess_cdexamsave\local\penalty_service;

/** Integration tests against Moodle's real question and gradebook services. */
#[\PHPUnit\Framework\Attributes\CoversClass(penalty_service::class)]
#[\PHPUnit\Framework\Attributes\CoversClass(incident_service::class)]
final class xirh_penalties_test extends \advanced_testcase {
    private function fixture(): array {
        global $CFG, $DB, $PAGE;
        $this->resetAfterTest(true);
        require_once($CFG->dirroot . '/mod/quiz/locallib.php');
        require_once($CFG->libdir . '/gradelib.php');
        $course = $this->getDataGenerator()->create_course();
        $user = $this->getDataGenerator()->create_user();
        $this->getDataGenerator()->enrol_user($user->id, $course->id, 'student');
        $quiz = $this->getDataGenerator()->create_module('quiz', ['course' => $course->id, 'grade' => 20]);
        $cm = get_coursemodule_from_instance('quiz', $quiz->id);
        $PAGE->set_course($course);
        $PAGE->set_cm($cm, $course);
        $questions = $this->getDataGenerator()->get_plugin_generator('core_question');
        $category = $questions->create_question_category();
        $question = $questions->create_question('shortanswer', null, ['category' => $category->id]);
        quiz_add_quiz_question($question->id, $quiz);
        \mod_quiz\quiz_settings::create($quiz->id)->get_grade_calculator()->recompute_quiz_sumgrades();
        $DB->set_field('quizaccess_cdexamsave', 'enabled', 1, ['quizid' => $quiz->id]);
        $DB->set_field('quizaccess_cdexamsave', 'penaltiesenabled', 1, ['quizid' => $quiz->id]);
        $DB->set_field('quizaccess_cdexamsave', 'penaltyfirst', 0, ['quizid' => $quiz->id]);
        $DB->set_field('quizaccess_cdexamsave', 'penaltysecond', 2, ['quizid' => $quiz->id]);
        $DB->set_field('quizaccess_cdexamsave', 'penaltylater', 3, ['quizid' => $quiz->id]);
        $this->setUser($user);
        $quizobj = \mod_quiz\quiz_settings::create($quiz->id, $user->id);
        $attempt = quiz_prepare_and_start_new_attempt($quizobj, 1, null, false, [], [], $user->id);
        $quiz = $DB->get_record('quiz', ['id' => $quiz->id]);
        $cm = get_coursemodule_from_instance('quiz', $quiz->id);
        return [$quiz, $attempt, $user, $cm];
    }

    private function signal($attempt, string $action = 'lost', int $index = 1): array {
        return incident_service::record(['attemptid' => $attempt->id, 'action' => $action,
            'pagesessionid' => '123e4567-e89b-42d3-a456-426614174000',
            'eventuuid' => sprintf('123e4567-e89b-42d3-a456-%012d', $index),
            'reason' => 'window_blur', 'clienttime' => time(), 'duration' => 1]);
    }

    public function test_progressive_server_penalties_and_uuid_retries(): void {
        global $DB;
        [$quiz, $attempt] = $this->fixture();
        foreach ([0, 2, 5, 8] as $i => $expected) {
            $result = $this->signal($attempt, 'lost', $i + 1);
            $this->assertEquals($expected, $result['penalty']);
            $this->signal($attempt, 'lost', $i + 1);
            $this->signal($attempt, 'returned', $i + 1);
        }
        $this->assertSame(4, $DB->count_records('quizaccess_cdexamsave_evt'));
        $this->assertSame(4, penalty_service::summary($attempt->id)['incidentcount']);
    }

    public function test_return_before_loss_and_frozen_policy(): void {
        global $DB;
        [$quiz, $attempt] = $this->fixture();
        $this->signal($attempt, 'returned', 1);
        $this->signal($attempt, 'lost', 1);
        $this->assertSame(1, $DB->count_records('quizaccess_cdexamsave_evt'));
        $this->assertEquals(0, $DB->get_field('quizaccess_cdexamsave_sess', 'focuslost', ['attemptid' => $attempt->id]));
        $DB->set_field('quizaccess_cdexamsave', 'penaltysecond', 9, ['quizid' => $quiz->id]);
        $this->assertEquals(2, $this->signal($attempt, 'lost', 2)['penalty']);
    }

    public function test_regrading_preserves_deduction_without_compounding(): void {
        global $DB;
        [$quiz, $attempt, $user] = $this->fixture();
        $this->signal($attempt, 'lost', 1);
        $this->signal($attempt, 'lost', 2);
        $this->signal($attempt, 'lost', 3);
        $attempt->state = 'finished';
        $attempt->timefinish = time();
        $attempt->sumgrades = $quiz->sumgrades * .8;
        $DB->update_record('quiz_attempts', $attempt);
        \mod_quiz\quiz_settings::create($quiz->id)->get_grade_calculator()->recompute_final_grade($user->id);
        penalty_service::sync_grades($quiz->id, $user->id);
        penalty_service::sync_grades($quiz->id, $user->id);
        $this->assertEqualsWithDelta(11, $DB->get_field('quiz_grades', 'grade', ['quiz' => $quiz->id, 'userid' => $user->id]), .00001);
        $item = \grade_item::fetch(['itemtype' => 'mod', 'itemmodule' => 'quiz', 'iteminstance' => $quiz->id, 'itemnumber' => 0]);
        $grade = \grade_grade::fetch(['itemid' => $item->id, 'userid' => $user->id]);
        $this->assertEqualsWithDelta(11, $grade->rawgrade, .00001);
        // A later essay/manual regrade increases the original question total, not a penalised total.
        $DB->set_field('quiz_attempts', 'sumgrades', $quiz->sumgrades * .9, ['id' => $attempt->id]);
        \mod_quiz\quiz_settings::create($quiz->id)->get_grade_calculator()->recompute_final_grade($user->id);
        $this->assertEqualsWithDelta(13, $DB->get_field('quiz_grades', 'grade', ['quiz' => $quiz->id, 'userid' => $user->id]), .00001);
        $this->setAdminUser();
        $event = $DB->get_record('quizaccess_cdexamsave_evt', ['attemptid' => $attempt->id, 'ordinal' => 2]);
        penalty_service::waive($event->id, 'Incident technique vérifié');
        penalty_service::waive($event->id, 'Double clic sans double remboursement');
        $this->assertEqualsWithDelta(15, $DB->get_field('quiz_grades', 'grade', ['quiz' => $quiz->id, 'userid' => $user->id]), .00001);
        $this->assertEquals(3, $DB->get_field('quizaccess_cdexamsave_evt', 'ordinal', ['attemptid' => $attempt->id, 'ordinal' => 3]));
    }

    public function test_history_expiry_does_not_restore_marks(): void {
        global $DB;
        [, $attempt] = $this->fixture();
        $this->signal($attempt, 'lost', 1);
        $this->signal($attempt, 'lost', 2);
        $DB->set_field('quizaccess_cdexamsave_evt', 'timecreated', time() - 200 * DAYSECS);
        (new \quizaccess_cdexamsave\task\cleanup())->execute();
        $this->assertSame(0, $DB->count_records('quizaccess_cdexamsave_evt'));
        $this->assertEquals(2, penalty_service::summary($attempt->id)['penalty']);
    }

    public function test_grade_methods_and_zero_floor(): void {
        $this->assertEquals(11, penalty_service::aggregate([11.0, 8.0], QUIZ_GRADEHIGHEST));
        $this->assertEquals(9.5, penalty_service::aggregate([11.0, 8.0], QUIZ_GRADEAVERAGE));
        $this->assertEquals(11, penalty_service::aggregate([11.0, 8.0], QUIZ_ATTEMPTFIRST));
        $this->assertEquals(8, penalty_service::aggregate([11.0, 8.0], QUIZ_ATTEMPTLAST));
    }

    public function test_attempt_page_bootstraps_without_oversized_amd_arguments(): void {
        global $CFG, $DB, $PAGE;
        [$quiz, $attempt, $user] = $this->fixture();
        require_once($CFG->dirroot . '/mod/quiz/accessrule/cdexamsave/rule.php');
        $quizobj = \mod_quiz\quiz_settings::create($quiz->id, $user->id);
        $quizobj->get_quiz()->cdexamsavewarnstudent = 1;
        $_GET['attempt'] = $attempt->id;
        try {
            (new \quizaccess_cdexamsave($quizobj, time()))->setup_attempt_page($PAGE);
            $this->assertDebuggingNotCalled();
            $this->assertTrue($DB->record_exists('quizaccess_cdexamsave_grade', ['attemptid' => $attempt->id]));
        } finally {
            unset($_GET['attempt']);
        }
    }

    public function test_student_cannot_waive_or_report_for_another_student(): void {
        [$quiz, $attempt] = $this->fixture();
        $this->signal($attempt);
        global $DB;
        $event = $DB->get_record('quizaccess_cdexamsave_evt', ['attemptid' => $attempt->id]);
        try {
            penalty_service::waive($event->id, 'Not authorised');
            $this->fail('A student must not cancel penalties');
        } catch (\required_capability_exception $exception) {
            $this->assertNotEmpty($exception->getMessage());
        }
        $other = $this->getDataGenerator()->create_user();
        $this->getDataGenerator()->enrol_user($other->id, $quiz->course, 'student');
        $this->setUser($other);
        $this->expectException(\moodle_exception::class);
        $this->signal($attempt, 'lost', 2);
    }

    public function test_grade_floor_and_manual_override(): void {
        global $DB;
        [$quiz, $attempt, $user] = $this->fixture();
        foreach ([1, 2, 3] as $index) {
            $this->signal($attempt, 'lost', $index);
        }
        $attempt->state = 'finished';
        $attempt->timefinish = time();
        $attempt->sumgrades = $quiz->sumgrades * .1;
        $DB->update_record('quiz_attempts', $attempt);
        \mod_quiz\quiz_settings::create($quiz->id)->get_grade_calculator()->recompute_final_grade($user->id);
        $this->assertEquals(0, $DB->get_field('quiz_grades', 'grade', ['quiz' => $quiz->id, 'userid' => $user->id]));
        $item = \grade_item::fetch(['itemtype' => 'mod', 'itemmodule' => 'quiz', 'iteminstance' => $quiz->id, 'itemnumber' => 0]);
        $grade = \grade_grade::fetch(['itemid' => $item->id, 'userid' => $user->id]);
        $grade->overridden = time();
        $grade->finalgrade = 19;
        $grade->update('test');
        penalty_service::sync_grades($quiz->id, $user->id);
        $this->assertEquals(19, $DB->get_field('grade_grades', 'finalgrade', ['id' => $grade->id]));
    }
}
