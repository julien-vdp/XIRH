# Moodle 5.2.4 — XIRH Academy

## Source and retained customizations

- Official upstream tag: `v5.2.4`, commit `2df605b1e093248e8f8d1e2fc081fb3b1f65665f`.
- Previous upstream baseline: `d8fe16e503abb80402759402877f030b3d1f0825` (5.2+ build 20260525).
- New release: `5.2.4 (Build: 20261005)`, database version `2026042004.00`.
- Upstream changes were merged against the baseline, preserving local additions and edits. Boost's compiled CSS was rebuilt from the customized SCSS after the merge.
- Retained: Academy templates, golden artwork, animated background, login overrides, custom user profile changes, Docker configuration and existing configuration file.

## Deployment procedure

1. Check PHP/database requirements and available storage.
2. Back up the database with a matching PostgreSQL client, the complete code directory, and moodledata. Keep the backups outside the web root and restrict access. Verify archive integrity and database restore.
3. Rehearse the CLI upgrade against a separate database and separate moodledata copy, with outbound mail disabled.
4. Enable maintenance using `php admin/cli/maintenance.php --enable` as `www-data`, then take a final consistent database and moodledata snapshot.
5. Deploy this code through Coolify. The Docker build installs the locked Composer dependencies. Startup clears caches; it does **not** migrate the database.
6. Run `php admin/cli/upgrade.php --non-interactive` as `www-data`. Verify the database release, preserved course/file counts, login, course catalogue and theme before disabling maintenance.

## Rollback

Keep maintenance enabled. Restore the previous Coolify image/commit together with the matching pre-upgrade database and moodledata backups. A code-only rollback after a database migration is insufficient. Never restore into a live database while requests or scheduled tasks can write to it. Verify the restored release and contents before reopening the site.

Backups contain private site data and must never be committed to Git or exposed under `public/`.
