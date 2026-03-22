# Backend (Laravel 12 API)

The backend for this TikTok Clone project is built with Laravel 12 and JWT authentication (`tymon/jwt-auth`).

## Core Stack

- PHP 8.2
- Laravel 12
- PostgreSQL
- Redis
- JWT Auth
- Pest (testing)
- PHPStan (static analysis)

## API Documentation

- Current API version base path: `/api/v1`
- Swagger/OpenAPI spec: `backend/docs/api/swagger.yaml`
- Swagger UI (served by backend): `/docs/swagger`
- Raw Swagger spec endpoint: `/docs/swagger.yaml`
- Database design (from migrations): `backend/docs/database/database-design.md`

## Run Locally (without Docker)

```bash
cd backend
composer install
copy .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

If you also need Vite assets:

```bash
npm install
npm run dev
```

## Run with Docker (recommended)

From the repository root:

```bash
docker compose -f compose.dev.yaml up --build -d
docker compose -f compose.dev.yaml exec workspace composer install
docker compose -f compose.dev.yaml exec workspace php artisan migrate
```

## Queue Worker (Docker)

Queue processing is handled by a dedicated `worker` service.

Common commands:

```bash
docker compose -f compose.dev.yaml logs -f worker
docker compose -f compose.dev.yaml restart worker
```

Worker process configuration:

- Development: `.docker/development/backend/worker/supervisord.conf` (mounted)
- Production: `.docker/production/backend/worker/supervisord.conf` (baked into image)

## Post View Sync (Redis -> PostgreSQL)

Post detail API (`GET /api/posts/{post_uuid}`) now records views in Redis first (fast path), then a scheduler syncs batched counters to PostgreSQL every minute.

Manual sync command:

```bash
php artisan posts:sync-views
```

Scheduler:

- Registered in `routes/console.php`
- Runs `posts:sync-views` every minute (`withoutOverlapping`)

Important: this feature requires Redis runtime support (`phpredis` extension in PHP container).

## Useful Commands

```bash
composer dev
composer test
```

Run static analysis:

```bash
vendor/bin/phpstan analyse
```

## Important Environment Variables

In `backend/.env`:

- `APP_ENV=local`
- `APP_DEBUG=true`
- `APP_URL=http://localhost:8000`
- `DB_CONNECTION=pgsql`
- `DB_HOST=127.0.0.1` (local default, overridden to `postgres` in Docker Compose)
- `DB_PORT=5432`
- `DB_DATABASE=tiktok_clone`
- `DB_USERNAME=root`
- `DB_PASSWORD=tiktok_clone_password`
- `REDIS_HOST=127.0.0.1` (local default, overridden to `redis` in Docker Compose)
- `JWT_SECRET=...`

## Notes

- Compose infrastructure variables are now managed in root `.env`, not in `backend/.env`.
- Nginx routes `/api` traffic to Laravel and proxies UI traffic to Next.js.
