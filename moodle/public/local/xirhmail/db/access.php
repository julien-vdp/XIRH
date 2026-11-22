<?php
defined('MOODLE_INTERNAL') || die();
$capabilities = [
    'local/xirhmail:manage' => [
        'riskbitmask' => RISK_PERSONAL | RISK_SPAM,
        'captype' => 'write',
        'contextlevel' => CONTEXT_SYSTEM,
        'archetypes' => ['manager' => CAP_ALLOW],
    ],
];
