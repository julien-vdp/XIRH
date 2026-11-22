<?php
namespace local_xirhmail;
defined('MOODLE_INTERNAL') || die();

final class navigation {
    public static function extend_primary(\core\hook\navigation\primary_extend $hook): void {
        if (isloggedin() && !isguestuser() && has_capability('local/xirhmail:manage', \context_system::instance())) {
            $hook->get_primaryview()->add(get_string('pluginname', 'local_xirhmail'),
                new \moodle_url('/local/xirhmail/index.php'), \navigation_node::TYPE_CUSTOM, null, 'xirhmail');
        }
    }
}
