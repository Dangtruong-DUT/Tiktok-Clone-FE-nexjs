#!/usr/bin/env sh

set -eu

cd /var/www

# Ensure required writable directories exist
mkdir -p \
	storage/framework/cache/data \
	storage/framework/sessions \
	storage/framework/views \
	storage/logs \
	bootstrap/cache

# Initialize storage volume content (best-effort)
if [ -d "/var/www/storage-init" ]; then
	if [ ! -d "/var/www/storage" ] || [ -z "$(ls -A /var/www/storage 2>/dev/null || true)" ]; then
		echo "[entrypoint] Initializing storage volume..."
		cp -a /var/www/storage-init/. /var/www/storage/ 2>/dev/null || true
	fi
fi

# Ensure perms are writable by the running user (best-effort)
chmod -R ug+rwx storage bootstrap/cache 2>/dev/null || true

# Create the storage symlink for Laravel (best-effort)
if [ ! -e public/storage ]; then
	ln -s /var/www/storage/app/public public/storage 2>/dev/null || true
fi

exec "$@"
