#!/usr/bin/env sh

set -eu

cd /var/www

mkdir -p \
	storage/framework/cache/data \
	storage/framework/sessions \
	storage/framework/views \
	storage/logs \
	bootstrap/cache

chmod -R ug+rwx storage bootstrap/cache 2>/dev/null || true

if [ ! -e public/storage ]; then
	ln -s /var/www/storage/app/public public/storage 2>/dev/null || true
fi

exec "$@"
