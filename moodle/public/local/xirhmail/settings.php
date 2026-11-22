<?php
defined('MOODLE_INTERNAL') || die();
if (has_capability('local/xirhmail:manage', context_system::instance())) {
    $ADMIN->add('accounts', new admin_externalpage('local_xirhmail',
        get_string('pluginname', 'local_xirhmail'), new moodle_url('/local/xirhmail/index.php'), 'local/xirhmail:manage'));
}
if ($hassiteconfig) {
    $settings = new admin_settingpage('local_xirhmail_settings', get_string('settings', 'local_xirhmail'));
    $ADMIN->add('localplugins', $settings);
    $settings->add(new admin_setting_configcheckbox('local_xirhmail/enabled',
        get_string('enabled', 'local_xirhmail'), get_string('enabled_desc', 'local_xirhmail'), 0));
    $settings->add(new admin_setting_configtext('local_xirhmail/mailbox',
        get_string('mailbox', 'local_xirhmail'), get_string('mailbox_desc', 'local_xirhmail'), 'moodle@xirh.fr', PARAM_EMAIL));
    $settings->add(new admin_setting_configtext('local_xirhmail/retentiondays',
        get_string('retention', 'local_xirhmail'), get_string('retention_desc', 'local_xirhmail'), 180, PARAM_INT));
}
