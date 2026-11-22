<?php
namespace local_xirhmail\task;
defined('MOODLE_INTERNAL') || die();

class sync_returns extends \core\task\scheduled_task {
    public function get_name() {
        return get_string('synctask', 'local_xirhmail');
    }

    public function execute() {
        \local_xirhmail\tracker::cleanup();
        if (get_config('local_xirhmail', 'enabled')) {
            $result = \local_xirhmail\tracker::sync();
            mtrace('XIRH mail: ' . $result['scanned'] . ' messages checked; ' . $result['added'] . ' reports added.');
        }
    }
}
