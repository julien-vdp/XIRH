<?php
defined('MOODLE_INTERNAL') || die();

/** Give authorised staff a direct shortcut without changing the site menu. */
function local_xirhmail_extend_navigation(global_navigation $navigation): void {
    if (isloggedin() && !isguestuser() && has_capability('local/xirhmail:manage', context_system::instance())) {
        $node = $navigation->add(get_string('pluginname', 'local_xirhmail'),
            new moodle_url('/local/xirhmail/index.php'), navigation_node::TYPE_CUSTOM, null, 'xirhmail',
            new pix_icon('i/email', ''));
        $node->showinflatnavigation = true;
    }
}
