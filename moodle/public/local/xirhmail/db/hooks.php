<?php
defined('MOODLE_INTERNAL') || die();
$callbacks = [[
    'hook' => \core\hook\navigation\primary_extend::class,
    'callback' => [\local_xirhmail\navigation::class, 'extend_primary'],
]];
