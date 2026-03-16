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

## Current API Endpoints

Base path: `/api`

Auth routes:

- `POST /api/auth/login` (public)
- `POST /api/auth/logout` (requires auth)
- `POST /api/auth/refresh` (requires auth)
- `GET /api/auth/me` (requires auth)

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

- `COMPOSE_PROJECT_NAME=tiktok_clone`
- `CONTAINER_PREFIX=backend`
- `NGINX_PORT=9696`
- `DB_CONNECTION=pgsql`
- `DB_HOST=postgres` (when running in Docker)
- `DB_PORT=5432`
- `DB_DATABASE=tiktok_clone`
- `DB_USERNAME=root`
- `DB_PASSWORD=tiktok_clone_password`
- `JWT_SECRET=...`

## Notes

- Default project naming has been normalized to `tiktok_clone`.
- Nginx routes `/api` traffic to Laravel and proxies UI traffic to Next.js.
