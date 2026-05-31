<?php
define('NO_OUTPUT_BUFFERING', true);
require('config.php');
require_once($CFG->libdir.'/adminlib.php');

// Require login and check if the user is a site admin
require_login();
if (!is_siteadmin()) {
    die('You must be a site administrator to purge caches.');
}

echo "<html><head><title>Purge Caches</title></head><body style='font-family: sans-serif; padding: 2rem;'>";
echo "<h2>Moodle Cache Purge Utility</h2>";
echo "<p>Purging all Moodle caches to apply the new <code>slasharguments</code> settings...</p>";
flush();

purge_all_caches();

echo "<p style='color: green; font-weight: bold;'>Done! Moodle caches have been successfully purged.</p>";
echo "<p><a href='index.php'>Go to Dashboard</a></p>";
echo "</body></html>";
