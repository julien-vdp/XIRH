<?php
namespace local_xirhmail\privacy;
defined('MOODLE_INTERNAL') || die();

use core_privacy\local\metadata\collection;
use core_privacy\local\request\approved_contextlist;
use core_privacy\local\request\approved_userlist;
use core_privacy\local\request\contextlist;
use core_privacy\local\request\userlist;
use core_privacy\local\request\writer;

class provider implements \core_privacy\local\metadata\provider,
        \core_privacy\local\request\plugin\provider, \core_privacy\local\request\core_userlist_provider {
    public static function get_metadata(collection $collection): collection {
        foreach (['local_xirhmail_bounce' => ['eventhash', 'userid', 'email', 'action', 'status', 'diagnostic',
                'messageid', 'senttime', 'timecreated'], 'local_xirhmail_invite' => ['requestkey', 'userid',
                'email', 'actorid', 'state', 'messageid', 'timecreated']] as $table => $fields) {
            $collection->add_database_table($table, array_fill_keys($fields, 'privacy:metadata:field'),
                $table === 'local_xirhmail_bounce' ? 'privacy:metadata:bounce' : 'privacy:metadata:invite');
        }
        $collection->add_external_location_link('ovh', ['email' => 'privacy:metadata:field'], 'privacy:metadata:ovh');
        return $collection;
    }

    public static function get_contexts_for_userid(int $userid): contextlist {
        $contexts = new contextlist();
        $contexts->add_from_sql('SELECT ctx.id FROM {context} ctx WHERE ctx.contextlevel=:level AND
            (EXISTS (SELECT 1 FROM {local_xirhmail_bounce} b WHERE b.userid=:uid)
            OR EXISTS (SELECT 1 FROM {local_xirhmail_invite} i WHERE i.userid=:uid2 OR i.actorid=:uid3))',
            ['level' => CONTEXT_SYSTEM, 'uid' => $userid, 'uid2' => $userid, 'uid3' => $userid]);
        return $contexts;
    }

    public static function get_users_in_context(userlist $userlist): void {
        if ($userlist->get_context()->contextlevel === CONTEXT_SYSTEM) {
            $userlist->add_from_sql('userid', 'SELECT userid FROM {local_xirhmail_bounce} WHERE userid > 0', []);
            $userlist->add_from_sql('userid', 'SELECT userid FROM {local_xirhmail_invite}', []);
            $userlist->add_from_sql('actorid', 'SELECT actorid FROM {local_xirhmail_invite} WHERE actorid > 0', []);
        }
    }

    public static function export_user_data(approved_contextlist $contextlist): void {
        global $DB;
        if (!in_array(\context_system::instance()->id, $contextlist->get_contextids())) {
            return;
        }
        $userid = $contextlist->get_user()->id;
        $bounces = $DB->get_records('local_xirhmail_bounce', ['userid' => $userid]);
        $invites = $DB->get_records('local_xirhmail_invite', ['userid' => $userid]);
        $actions = $DB->get_records('local_xirhmail_invite', ['actorid' => $userid], '', 'id,state,timecreated');
        writer::with_context(\context_system::instance())->export_data([get_string('privacy:path', 'local_xirhmail')],
            (object)['deliveryreports' => array_values($bounces), 'invitations' => array_values($invites),
                'staffactions' => array_values($actions)]);
    }

    public static function delete_data_for_all_users_in_context(\context $context): void {
        global $DB;
        if ($context->contextlevel === CONTEXT_SYSTEM) {
            $DB->delete_records('local_xirhmail_bounce');
            $DB->delete_records('local_xirhmail_invite');
        }
    }

    public static function delete_data_for_user(approved_contextlist $contextlist): void {
        if (in_array(\context_system::instance()->id, $contextlist->get_contextids())) {
            self::delete_users([$contextlist->get_user()->id]);
        }
    }

    public static function delete_data_for_users(approved_userlist $userlist): void {
        if ($userlist->get_context()->contextlevel === CONTEXT_SYSTEM) {
            self::delete_users($userlist->get_userids());
        }
    }

    private static function delete_users(array $ids): void {
        global $DB;
        if (!$ids) {
            return;
        }
        $DB->delete_records_list('local_xirhmail_bounce', 'userid', $ids);
        $DB->delete_records_list('local_xirhmail_invite', 'userid', $ids);
        // Keep other students' records while anonymising the requesting staff member.
        [$insql, $params] = $DB->get_in_or_equal($ids, SQL_PARAMS_NAMED);
        $DB->set_field_select('local_xirhmail_invite', 'actorid', 0, 'actorid ' . $insql, $params);
    }
}
