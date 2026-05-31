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

// Public Root URL (must contain the subpath /learning)
$CFG->wwwroot   = getenv('MOODLE_WWWROOT') ?: 'https://www.xirh.fr/learning';

// Location of user-uploaded files (must be writeable by web server, outside public web directory)
$CFG->dataroot  = '/var/moodledata';

// Set admin directory name
$CFG->admin     = 'admin';

// Permissions for created folders
$CFG->directorypermissions = 02777;

// Reverse Proxy and SSL Configuration (MANDATORY for Coolify/Traefik)
$CFG->reverseproxy = false;
$CFG->sslproxy = true;
$CFG->slasharguments = false;

// Force SSL for login and pages
$CFG->forcetimezone = 'UTC';

// Load Moodle Setup
require_once(__DIR__ . '/lib/setup.php');
