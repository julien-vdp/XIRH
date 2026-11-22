<?php
// XIRH BPMN question type. GNU GPL v3 or later.
defined('MOODLE_INTERNAL') || die();

/** A diagram answer with native Moodle manual grading. */
class qtype_xirhbpmn extends question_type {
    public function is_manual_graded() {
        return true;
    }

    public function get_random_guess_score($questiondata) {
        return null;
    }

    public function import_from_xml($data, $question, qformat_xml $format, $extra = null) {
        if (($data['@']['type'] ?? '') !== 'xirhbpmn') {
            return false;
        }
        $question = $format->import_headers($data);
        $question->qtype = 'xirhbpmn';
        return $question;
    }

    public function export_to_xml($question, qformat_xml $format, $extra = null) {
        // All settings are standard question fields, exported by qformat_xml.
        return "    <xirhbpmnversion>1</xirhbpmnversion>\n";
    }
}
