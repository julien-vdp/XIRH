<?php
// XIRH BPMN question type. GNU GPL v3 or later.
namespace qtype_xirhbpmn;
defined('MOODLE_INTERNAL') || die();
global $CFG;
require_once($CFG->dirroot . '/question/engine/tests/helpers.php');

#[\PHPUnit\Framework\Attributes\CoversClass(\qtype_xirhbpmn_question::class)]
#[\PHPUnit\Framework\Attributes\CoversClass(\qtype_xirhbpmn::class)]
#[\PHPUnit\Framework\Attributes\CoversClass(\qtype_xirhbpmn_renderer::class)]
final class question_test extends \advanced_testcase {
    public function test_native_save_resume_submit_and_manual_grade(): void {
        $this->resetAfterTest();
        $this->setAdminUser();
        $generator = $this->getDataGenerator()->get_plugin_generator('core_question');
        $category = $generator->create_question_category();
        $data = $generator->create_question('xirhbpmn', 'simple', ['category' => $category->id]);
        $question = \question_bank::load_question($data->id);
        $xml = file_get_contents(__DIR__ . '/fixtures/process.bpmn');
        $usage = \question_engine::make_questions_usage_by_activity('core_question_preview', \context_system::instance());
        $usage->set_preferred_behaviour('deferredfeedback');
        $slot = $usage->add_question($question, 10);
        $usage->start_all_questions();
        $this->assertSame('manualgraded', $usage->get_question_attempt($slot)->get_behaviour_name());
        $this->assertSame(\question_state::$todo, $usage->get_question_state($slot));
        $usage->process_action($slot, ['answer' => $xml]);
        $this->assertSame(\question_state::$complete, $usage->get_question_state($slot));
        \question_engine::save_questions_usage_by_activity($usage);
        $resumed = \question_engine::load_questions_usage_by_activity($usage->get_id());
        $this->assertSame($xml, $resumed->get_question_attempt($slot)->get_last_qt_var('answer'));
        $this->assertStringContainsString('Traiter la demande', $question->summarise_response(['answer' => $xml]));
        $resumed->finish_all_questions();
        $this->assertSame(\question_state::$needsgrading, $resumed->get_question_state($slot));
        $this->assertNull($resumed->get_question_mark($slot));
        $resumed->manual_grade($slot, 'Processus clair, libellés précis.', 8, FORMAT_PLAIN);
        $this->assertEquals(8, $resumed->get_question_mark($slot));
        $this->assertSame($xml, $resumed->get_question_attempt($slot)->get_last_qt_var('answer'));
    }

    public function test_blank_invalid_and_unchanged_responses(): void {
        $question = \test_question_maker::make_question('xirhbpmn', 'simple');
        $this->assertFalse($question->is_complete_response([]));
        $this->assertFalse($question->is_gradable_response(['answer' => '']));
        $this->assertFalse($question->is_complete_response(['answer' => '<script/>']));
        $this->assertTrue($question->is_gradable_response(['answer' => '<script/>']));
        $this->assertNull($question->summarise_response([]));
        $this->assertTrue($question->is_same_response([], ['answer' => '']));
        $this->assertFalse($question->is_same_response(['answer' => 'a'], ['answer' => 'b']));
        $this->assertNull($question->get_correct_response());
    }

    public function test_renderer_escapes_xml_and_supports_readonly(): void {
        global $PAGE;
        $this->resetAfterTest();
        $this->setAdminUser();
        $PAGE->set_url('/');
        $question = \test_question_maker::make_question('xirhbpmn', 'simple');
        $usage = \question_engine::make_questions_usage_by_activity('core_question_preview', \context_system::instance());
        $usage->set_preferred_behaviour('deferredfeedback');
        $slot = $usage->add_question($question);
        $usage->start_all_questions();
        $xml = str_replace('Traiter la demande', '&lt;img src=x onerror=alert(1)&gt;',
            file_get_contents(__DIR__ . '/fixtures/process.bpmn'));
        $usage->process_action($slot, ['answer' => $xml]);
        $options = new \question_display_options();
        $options->readonly = true;
        $html = $usage->render_question($slot, $options);
        $this->assertStringContainsString('data-readonly="1"', $html);
        $this->assertStringNotContainsString('<bpmn:definitions', $html);
        $this->assertStringNotContainsString('<img src=x', $html);
    }

    public function test_question_can_be_created_and_reloaded(): void {
        $this->resetAfterTest();
        $this->setAdminUser();
        $generator = $this->getDataGenerator()->get_plugin_generator('core_question');
        $category = $generator->create_question_category();
        $data = $generator->create_question('xirhbpmn', 'simple', ['category' => $category->id]);
        $question = \question_bank::load_question($data->id);
        $this->assertInstanceOf(\qtype_xirhbpmn_question::class, $question);
        $this->assertEquals(10, $question->defaultmark);
    }

    public function test_question_xml_export_and_import(): void {
        global $CFG;
        require_once($CFG->dirroot . '/question/format/xml/format.php');
        $this->resetAfterTest();
        $this->setAdminUser();
        $generator = $this->getDataGenerator()->get_plugin_generator('core_question');
        $category = $generator->create_question_category();
        $data = $generator->create_question('xirhbpmn', 'simple', ['category' => $category->id]);
        $format = new \qformat_xml();
        $xml = $format->writequestion(\question_bank::load_question_data($data->id));
        $this->assertStringContainsString('<question type="xirhbpmn">', $xml);
        $imported = $format->readquestions(explode("\n", '<quiz>' . $xml . '</quiz>'));
        $this->assertCount(1, $imported);
        $this->assertSame('xirhbpmn', $imported[0]->qtype);
        $this->assertEquals(10, $imported[0]->defaultmark);
        $this->assertStringContainsString('Dessinez', $imported[0]->questiontext);
    }
}
