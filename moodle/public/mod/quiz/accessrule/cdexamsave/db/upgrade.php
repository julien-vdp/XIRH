<?php
// XIRH Academy extension. GNU GPL v3 or later.
defined('MOODLE_INTERNAL') || die();
function xmldb_quizaccess_cdexamsave_upgrade($oldversion) {
    global $DB;
    if ($oldversion < 2026112100) {
        $dbman = $DB->get_manager();
        $file = new xmldb_file(__DIR__ . '/install.xml');
        $file->loadXMLStructure();
        foreach ($file->getStructure()->getTables() as $table) {
            if (!$dbman->table_exists($table)) {
                $dbman->create_table($table);
            } else {
                foreach ($table->getFields() as $field) {
                    if (!$dbman->field_exists($table, $field)) {
                        $dbman->add_field($table, $field);
                    }
                }
            }
        }
        upgrade_plugin_savepoint(true, 2026112100, 'quizaccess', 'cdexamsave');
    }
    return true;
}
