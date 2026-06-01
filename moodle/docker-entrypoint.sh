#!/bin/bash
set -e

# Wait for DB and purge Moodle theme cache so CSS changes apply on every redeploy
echo "[entrypoint] Waiting for database..."
for i in $(seq 1 15); do
    php -r "
        \$host = getenv('MOODLE_DB_HOST') ?: 'localhost';
        \$port = getenv('MOODLE_DB_PORT') ?: '5432';
        \$conn = @pg_connect(\"host=\$host port=\$port dbname=postgres connect_timeout=2\");
        exit(\$conn ? 0 : 1);
    " 2>/dev/null && break
    echo "[entrypoint] DB not ready, retrying ($i/15)..."
    sleep 2
done

echo "[entrypoint] Purging Moodle caches..."
su -s /bin/bash www-data -c "php /var/www/html/learning/admin/cli/purge_caches.php" \
    && echo "[entrypoint] Cache purged." \
    || echo "[entrypoint] Cache purge failed, continuing anyway."

exec apache2-foreground
