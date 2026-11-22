<?php
// XIRH BPMN question type. GNU GPL v3 or later.
namespace qtype_xirhbpmn\privacy;
defined('MOODLE_INTERNAL') || die();

/** Responses are exported/deleted by Moodle's question engine. */
class provider implements \core_privacy\local\metadata\provider,
        \core_privacy\local\request\user_preference_provider {
    public static function get_metadata(\core_privacy\local\metadata\collection $collection):
            \core_privacy\local\metadata\collection {
        foreach (['defaultmark', 'penalty'] as $key) {
            $collection->add_user_preference('qtype_xirhbpmn_' . $key, 'privacy:preference:' . $key);
        }
        return $collection;
    }

    public static function export_user_preferences(int $userid) {
        foreach (['defaultmark', 'penalty'] as $key) {
            $value = get_user_preferences('qtype_xirhbpmn_' . $key, null, $userid);
            if ($value !== null) {
                \core_privacy\local\request\writer::export_user_preference('qtype_xirhbpmn', $key, $value,
                    get_string('privacy:preference:' . $key, 'qtype_xirhbpmn'));
            }
        }
    }
}
