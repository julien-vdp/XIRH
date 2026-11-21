<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Backup support for per-quiz CD ExamFocus settings.
 *
 * Attempt policies, deductions and incidents are copied only when the backup
 * includes user attempts. A reusable quiz backup retains only its settings.
 *
 * @package    quizaccess_cdexamsave
 * @copyright  2026 Carlos Díaz Bueno
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class backup_quizaccess_cdexamsave_subplugin extends backup_mod_quiz_access_subplugin {
    /** Preserve assessment deductions when user attempts are included in a backup. */
    protected function define_attempt_subplugin_structure() {
        $subplugin = $this->get_subplugin_element();
        $wrapper = new backup_nested_element($this->get_recommended_name());
        $subplugin->add_child($wrapper);
        $fields = ['quizid', 'userid', 'incidentcount', 'penalty', 'requirefullscreen', 'penaltiesenabled',
            'penaltyfirst', 'penaltysecond', 'penaltylater', 'graceperiodms', 'timecreated', 'timemodified'];
        $grade = new backup_nested_element('cdexamsave_grade', ['id'], $fields);
        $wrapper->add_child($grade);
        $grade->set_source_table('quizaccess_cdexamsave_grade', ['attemptid' => backup::VAR_PARENTID]);
        $grade->annotate_ids('user', 'userid');
        $events = new backup_nested_element('cdexamsave_incidents');
        $event = new backup_nested_element('cdexamsave_incident', ['id'],
            ['quizid', 'userid', 'reason', 'ordinal', 'penalty', 'waivedby', 'timewaived', 'waivereason',
                'timestart', 'timeend', 'duration', 'clientstart', 'clientend', 'timecreated', 'timemodified']);
        $wrapper->add_child($events);
        $events->add_child($event);
        $event->set_source_table('quizaccess_cdexamsave_evt', ['attemptid' => backup::VAR_PARENTID]);
        $event->annotate_ids('user', 'userid');
        $event->annotate_ids('user', 'waivedby');
        return $subplugin;
    }
    /**
     * Define settings included in quiz backup.
     *
     * @return backup_subplugin_element
     */
    protected function define_quiz_subplugin_structure() {
        $subplugin = $this->get_subplugin_element();
        $wrapper = new backup_nested_element($this->get_recommended_name());
        $setting = new backup_nested_element(
            'cdexamsave_setting',
            ['id'],
            ['enabled', 'warnstudent', 'graceperiodms', 'requirefullscreen', 'penaltiesenabled', 'penaltyfirst', 'penaltysecond', 'penaltylater', 'timecreated', 'timemodified']
        );
        $subplugin->add_child($wrapper);
        $wrapper->add_child($setting);
        $setting->set_source_table('quizaccess_cdexamsave', [
            'quizid' => backup::VAR_ACTIVITYID,
        ]);
        return $subplugin;
    }
}
