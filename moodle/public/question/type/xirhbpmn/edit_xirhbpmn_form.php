<?php
// XIRH BPMN question type. GNU GPL v3 or later.
defined('MOODLE_INTERNAL') || die();

/** Standard prompt, marks and feedback; no external editor account or model answer required. */
class qtype_xirhbpmn_edit_form extends question_edit_form {
    protected function definition_inner($mform) {
        $mform->addElement('static', 'bpmnhelp', '', get_string('authorhelp', 'qtype_xirhbpmn'));
    }

    public function qtype() {
        return 'xirhbpmn';
    }
}
