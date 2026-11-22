<?php
// XIRH BPMN question type. GNU GPL v3 or later.
defined('MOODLE_INTERNAL') || die();

/** Escape the stored response; only validated BPMN reaches the modeler. */
class qtype_xirhbpmn_renderer extends qtype_renderer {
    public function formulation_and_controls(question_attempt $qa, question_display_options $options) {
        $question = $qa->get_question();
        $value = $qa->get_last_qt_var('answer', '');
        $id = $qa->get_qt_field_name('answer');
        $readonly = !empty($options->readonly);
        $valid = $value === '' || \qtype_xirhbpmn\diagram::inspect($value) !== null;
        $result = html_writer::div($question->format_questiontext($qa), 'qtext');
        if (!$valid) {
            // Preserve malformed raw data for grading, but do not load it into the canvas.
            return $result . html_writer::div(get_string('invaliddiagram', 'qtype_xirhbpmn'), 'alert alert-warning') .
                html_writer::tag('textarea', s($value), ['name' => $id, 'readonly' => true,
                    'class' => 'xirhbpmn-invalid form-control',
                    'aria-label' => get_string('diagramdata', 'qtype_xirhbpmn')]);
        }
        $this->page->requires->js_call_amd('qtype_xirhbpmn/editor-lazy', 'init', [$id, $readonly]);
        $field = html_writer::tag('textarea', s($value), [
            'id' => $id, 'name' => $id, 'class' => 'xirhbpmn-answer',
            'readonly' => $readonly, 'aria-label' => get_string('diagramdata', 'qtype_xirhbpmn'),
        ]);
        $labels = ['title', 'subtitle', 'help', 'loading', 'ready', 'failure', 'pending', 'limit', 'start', 'end',
            'task', 'gateway', 'connect', 'undo', 'redo', 'delete', 'fit', 'zoomin', 'zoomout', 'select', 'label', 'empty'];
        $attributes = ['class' => 'xirhbpmn-editor', 'data-field' => $id, 'data-readonly' => $readonly ? '1' : '0'];
        $attributes['data-assets'] = (new moodle_url('/question/type/xirhbpmn/vendor/'))->out(false);
        foreach ($labels as $label) {
            $attributes['data-' . $label] = get_string($label, 'qtype_xirhbpmn');
        }
        $result .= html_writer::tag('div', $field . html_writer::div(
            get_string('loading', 'qtype_xirhbpmn'), 'xirhbpmn-loading'), $attributes);
        if ($qa->get_state() === question_state::$invalid) {
            $result .= html_writer::div($question->get_validation_error(['answer' => $value]), 'validationerror');
        }
        return $result;
    }
}
