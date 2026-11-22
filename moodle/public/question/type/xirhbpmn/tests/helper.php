<?php
// XIRH BPMN question type. GNU GPL v3 or later.
defined('MOODLE_INTERNAL') || die();

class qtype_xirhbpmn_test_helper extends question_test_helper {
    public function get_test_questions() {
        return ['simple'];
    }

    public function make_xirhbpmn_question_simple() {
        question_bank::load_question_definition_classes('xirhbpmn');
        $question = new qtype_xirhbpmn_question();
        test_question_maker::initialise_a_question($question);
        $question->name = 'Dessiner une demande de congé';
        $question->questiontext = 'Représentez la réception et le traitement d’une demande de congé.';
        $question->generalfeedback = 'Un début, une tâche de traitement et une fin.';
        $question->qtype = question_bank::get_qtype('xirhbpmn');
        return $question;
    }

    public function get_xirhbpmn_question_form_data_simple() {
        return (object)[
            'name' => 'Dessiner une demande de congé',
            'questiontext' => ['text' => 'Dessinez le traitement d’une demande de congé.', 'format' => FORMAT_HTML],
            'defaultmark' => 10,
            'generalfeedback' => ['text' => 'Début, traitement, fin.', 'format' => FORMAT_HTML],
            'status' => \core_question\local\bank\question_version_status::QUESTION_STATUS_READY,
        ];
    }
}
