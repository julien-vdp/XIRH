#!/bin/bash
set -e

echo "[entrypoint] Creating directory symlinks..."
ln -sf /var/www/html/learning/public/theme /var/www/html/learning/theme
ln -sf /var/www/html/learning/public/pix /var/www/html/learning/pix
echo "[entrypoint] Symlinks created."

echo "[entrypoint] Clearing Moodle theme & template caches..."
rm -rf /var/moodledata/localcache/theme/
rm -rf /var/moodledata/cache/theme/
rm -rf /var/moodledata/localcache/mustache/
echo "[entrypoint] Cache folders deleted."

echo "[entrypoint] Running Moodle CLI cache purge..."
su -s /bin/bash -c "php /var/www/html/learning/admin/cli/purge_caches.php" www-data || true
echo "[entrypoint] CLI cache purge complete."

echo "[entrypoint] Starting Apache..."
exec apache2-foreground
