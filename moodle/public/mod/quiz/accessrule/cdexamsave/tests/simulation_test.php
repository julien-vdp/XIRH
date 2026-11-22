<?php
// XIRH Academy extension. GNU GPL v3 or later.
namespace quizaccess_cdexamsave;
defined('MOODLE_INTERNAL') || die();
use quizaccess_cdexamsave\local\simulation;

/** A teacher rehearsal must not create or alter assessment records. */
#[\PHPUnit\Framework\Attributes\CoversClass(simulation::class)]
#[\PHPUnit\Framework\Attributes\CoversClass(\quizaccess_cdexamsave::class)]
final class simulation_test extends \advanced_testcase {
    private function quiz(): array {
        global $CFG, $DB;
        require_once($CFG->dirroot . '/mod/quiz/locallib.php');
        require_once($CFG->dirroot . '/mod/quiz/accessrule/cdexamsave/rule.php');
        $course = $this->getDataGenerator()->create_course();
        // Keep fixture enrolments from sending welcome messages and initialising the page theme.
        $DB->set_field('enrol', 'customint1', ENROL_DO_NOT_SEND_EMAIL, ['courseid' => $course->id, 'enrol' => 'manual']);
        $teacher = $this->getDataGenerator()->create_user();
        $student = $this->getDataGenerator()->create_user();
        $this->getDataGenerator()->enrol_user($teacher->id, $course->id, 'editingteacher');
        $this->getDataGenerator()->enrol_user($student->id, $course->id, 'student');
        $quiz = $this->getDataGenerator()->create_module('quiz', ['course' => $course->id, 'grade' => 20,
            'cdexamsaveenabled' => 1, 'cdexamsaverequirefullscreen' => 1, 'cdexamsavepenaltiesenabled' => 1,
            'cdexamsavepenaltyfirst' => 0, 'cdexamsavepenaltysecond' => 2, 'cdexamsavepenaltylater' => 3]);
        $cm = get_coursemodule_from_instance('quiz', $quiz->id);
        $questions = $this->getDataGenerator()->get_plugin_generator('core_question');
        $category = $questions->create_question_category(['contextid' => \context_course::instance($course->id)->id]);
        $question = $questions->create_question('multichoice', 'one_of_four', ['category' => $category->id]);
        quiz_add_quiz_question($question->id, $quiz);
        \mod_quiz\quiz_settings::create($quiz->id)->get_grade_calculator()->recompute_quiz_sumgrades();
        return [$course, $quiz, $cm, $teacher, $student];
    }

    private function records(): array {
        global $DB;
        $result = [];
        foreach (['quizaccess_cdexamsave', 'quizaccess_cdexamsave_grade', 'quizaccess_cdexamsave_evt',
                'quizaccess_cdexamsave_sess', 'quiz_attempts', 'quiz_grades', 'grade_grades'] as $table) {
            $result[$table] = $DB->get_records($table, null, 'id ASC');
        }
        return $result;
    }

    public function test_teacher_configuration_is_readonly_and_uses_quiz_policy(): void {
        $this->resetAfterTest();
        [$course, $quiz, $cm, $teacher] = $this->quiz();
        $this->setUser($teacher);
        $before = $this->records();
        $config = simulation::configuration((int)$cm->id);
        $this->assertTrue($config['simulation']);
        $this->assertSame(0, $config['attemptId']);
        $this->assertSame([0.0, 2.0, 3.0], $config['rates']);
        $this->assertSame(20.0, $config['gradeMax']);
        $this->assertTrue($config['requireFullscreen']);
        $this->assertFalse(simulation::configuration((int)$cm->id, false)['requireFullscreen']);
        $this->assertEquals($before, $this->records());
    }

    public function test_student_cannot_open_teacher_rehearsal(): void {
        $this->resetAfterTest();
        [$course, $quiz, $cm, $teacher, $student] = $this->quiz();
        $this->setUser($student);
        $this->expectException(\required_capability_exception::class);
        simulation::configuration((int)$cm->id);
    }

    public function test_preview_only_adds_notice_without_monitoring_records(): void {
        global $DB, $PAGE;
        $this->resetAfterTest();
        [$course, $quiz, $cm, $teacher] = $this->quiz();
        $this->setUser($teacher);
        $PAGE->set_course($course);
        $PAGE->set_cm($cm, $course);
        $quizobj = \mod_quiz\quiz_settings::create($quiz->id, $teacher->id);
        $attempt = quiz_prepare_and_start_new_attempt($quizobj, 1, null, true, [], [], $teacher->id);
        $before = $this->records();
        $_GET['attempt'] = $attempt->id;
        try {
            $rule = new \quizaccess_cdexamsave($quizobj, time());
            $rule->setup_attempt_page($PAGE);
            $this->assertEquals($before, $this->records());
            $this->assertFalse($DB->record_exists('quizaccess_cdexamsave_grade', ['attemptid' => $attempt->id]));
            $this->assertStringContainsString('simulation.php', implode(' ', $rule->description()));
            $this->assertStringContainsString('preview', $PAGE->requires->get_end_code());
        } finally {
            unset($_GET['attempt']);
        }
    }

    public function test_simulation_query_flags_do_not_disable_real_attempt_monitoring(): void {
        global $DB, $PAGE;
        $this->resetAfterTest();
        [$course, $quiz, $cm, $teacher, $student] = $this->quiz();
        $this->setUser($student);
        $PAGE->set_course($course);
        $PAGE->set_cm($cm, $course);
        $quizobj = \mod_quiz\quiz_settings::create($quiz->id, $student->id);
        $attempt = quiz_prepare_and_start_new_attempt($quizobj, 1, null, false, [], [], $student->id);
        $_GET['attempt'] = $attempt->id;
        $_GET['simulation'] = 1;
        $_GET['fullscreen'] = 0;
        try {
            (new \quizaccess_cdexamsave($quizobj, time()))->setup_attempt_page($PAGE);
            $policy = $DB->get_record('quizaccess_cdexamsave_grade', ['attemptid' => $attempt->id], '*', MUST_EXIST);
            $this->assertEquals(1, $policy->requirefullscreen);
            $this->assertEquals(1, $policy->penaltiesenabled);
            $this->assertStringNotContainsString('simulation.php', implode(' ',
                (new \quizaccess_cdexamsave($quizobj, time()))->description()));
        } finally {
            unset($_GET['attempt'], $_GET['simulation'], $_GET['fullscreen']);
        }
    }
}
