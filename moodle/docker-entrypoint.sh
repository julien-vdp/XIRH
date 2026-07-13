#!/bin/bash
set -e

echo "[entrypoint] Creating directory symlinks..."
ln -sf /var/www/html/learning/public/theme /var/www/html/learning/theme
ln -sf /var/www/html/learning/public/pix /var/www/html/learning/pix
echo "[entrypoint] Symlinks created."

echo "[entrypoint] Clearing Moodle theme & template caches..."
rm -rf /var/moodledata/localcache/theme/*
rm -rf /var/moodledata/cache/theme/*
rm -rf /var/moodledata/localcache/mustache/*
rm -rf /var/moodledata/cache/mustache/*
echo "[entrypoint] Theme & template cache folders deleted."

echo "[entrypoint] Starting Apache..."
exec apache2-foreground
