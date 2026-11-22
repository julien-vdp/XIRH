<?php
// XIRH BPMN question type. GNU GPL v3 or later.
defined('MOODLE_INTERNAL') || die();

/** A student's BPMN XML is an ordinary question-engine response. */
class qtype_xirhbpmn_question extends question_with_responses {
    public function make_behaviour(question_attempt $qa, $preferredbehaviour) {
        return question_engine::make_behaviour('manualgraded', $qa, $preferredbehaviour);
    }

    public function get_expected_data() {
        return ['answer' => PARAM_RAW];
    }

    public function get_correct_response() {
        return null;
    }

    public function is_complete_response(array $response) {
        $diagram = \qtype_xirhbpmn\diagram::inspect($response['answer'] ?? '');
        return $diagram !== null && $diagram['shapes'] > 0;
    }

    public function is_gradable_response(array $response) {
        // Retain even malformed responses for the teacher, without rendering unsafe XML.
        return trim($response['answer'] ?? '') !== '';
    }

    public function get_validation_error(array $response) {
        return $this->is_complete_response($response) ? '' : get_string('invaliddiagram', 'qtype_xirhbpmn');
    }

    public function is_same_response(array $prevresponse, array $newresponse) {
        return ($prevresponse['answer'] ?? '') === ($newresponse['answer'] ?? '');
    }

    public function summarise_response(array $response) {
        if (trim($response['answer'] ?? '') === '') {
            return null;
        }
        $diagram = \qtype_xirhbpmn\diagram::inspect($response['answer']);
        if ($diagram === null) {
            return get_string('invaliddiagram', 'qtype_xirhbpmn');
        }
        return get_string('summary', 'qtype_xirhbpmn', (object)[
            'shapes' => $diagram['shapes'], 'flows' => $diagram['flows'],
        ]) . ($diagram['labels'] ? ' — ' . implode(' / ', $diagram['labels']) : '');
    }
}
