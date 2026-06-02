#!/bin/bash
set -e

echo "[entrypoint] Clearing Moodle theme cache..."
rm -rf /var/moodledata/localcache/theme/
rm -rf /var/moodledata/cache/theme/
echo "[entrypoint] Theme cache cleared."

echo "[entrypoint] Starting Apache..."
exec apache2-foreground
