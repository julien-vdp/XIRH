<?php
unset($CFG);
global $CFG;
$CFG = new stdClass();

// Database Configuration
$CFG->dbtype    = 'pgsql';
$CFG->dblibrary = 'native';
$CFG->dbhost    = getenv('MOODLE_DB_HOST') ?: 'localhost';
$CFG->dbname    = getenv('MOODLE_DB_NAME') ?: 'moodle_db';
$CFG->dbuser    = getenv('MOODLE_DB_USER') ?: 'moodle_user';
$CFG->dbpass    = getenv('MOODLE_DB_PASS') ?: '';
$CFG->dbport    = getenv('MOODLE_DB_PORT') ?: '5432';
$CFG->prefix    = 'mdl_';

$CFG->dboptions = array(
    'dbpersist' => 0,
    'dbport' => $CFG->dbport,
    'dbsocket' => '',
    'dbcollation' => 'utf8_bin',
);

// Public Root URL (dynamically detected to support Coolify test environments, local dev, and production)
if (isset($_SERVER['HTTP_HOST'])) {
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? "https://" : "http://";
    // Check X-Forwarded-Proto header sent by Coolify/Traefik reverse proxy
    if (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https') {
        $protocol = "https://";
    }
    $CFG->wwwroot = $protocol . $_SERVER['HTTP_HOST'] . '/learning';
} else {
    // Fallback for CLI scripts or environment variables
    $CFG->wwwroot = getenv('MOODLE_WWWROOT') ?: 'https://www.xirh.fr/learning';
}

// Location of user-uploaded files (must be writeable by web server, outside public web directory)
$CFG->dataroot  = '/var/moodledata';

// Set admin directory name
$CFG->admin     = 'admin';

// Permissions for created folders
$CFG->directorypermissions = 02777;

// Reverse Proxy and SSL Configuration (MANDATORY for Coolify/Traefik)
$CFG->reverseproxy = false;
$CFG->sslproxy = (strpos($CFG->wwwroot, 'https://') === 0);
$CFG->slasharguments = false;

// Force SSL for login and pages
$CFG->forcetimezone = 'UTC';

// Enable Developer Debugging
@error_reporting(E_ALL | E_STRICT);
@ini_set('display_errors', '1');
$CFG->debug = 32767; // DEVELOPER
$CFG->debugdisplay = true;

// Load Moodle Setup
require_once(__DIR__ . '/lib/setup.php');
