<?php
defined('MOODLE_INTERNAL') || die();
$tasks = [[
    'classname' => '\\local_xirhmail\\task\\sync_returns',
    'blocking' => 0,
    'minute' => '*/5', 'hour' => '*', 'day' => '*', 'month' => '*', 'dayofweek' => '*',
]];
