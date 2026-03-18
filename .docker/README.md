# Docker Guide

This document describes the Docker setup used by the tiktok-clone monorepo.

## Goals

- Keep development and production environments consistent
- Separate frontend, backend, database, and cache services clearly
- Use a centralized and maintainable Nginx configuration

## Nginx Organization (Split Backend and Frontend)

Nginx is now split into two template sets:

- Backend:
  - `./.docker/common/nginx/backend-templates/nginx.conf.template`
  - `./.docker/common/nginx/backend-templates/conf.d/backend.conf.template`
  - `./.docker/common/nginx/backend-templates/snippets/cors-api.conf.template`
- Frontend:
  - `./.docker/common/nginx/frontend-templates/nginx.conf.template`
  - `./.docker/common/nginx/frontend-templates/conf.d/frontend.conf.template`

This structure is used by both environments:

- Development: mounted by `compose.dev.yaml` into `/etc/nginx/templates`
- Production: backend templates are copied by `.docker/production/backend/nginx/Dockerfile`

## Directory Structure

```text
.docker/
|- common/
|  |- nginx/
|  |  |- backend-templates/
|  |  |  |- nginx.conf.template
|  |  |  |- conf.d/backend.conf.template
|  |  |  `- snippets/cors-api.conf.template
|  |  `- frontend-templates/
|  |     |- nginx.conf.template
|  |     `- conf.d/frontend.conf.template
|  `- backend/
|     `- php-fpm/
|        |- Dockerfile
|        `- conf.d/
|- development/
|  |- backend/
|  |  |- workspace/Dockerfile
|  |  `- worker/supervisord.conf
|  |  `- workspace/Dockerfile
|  `- frontend/Dockerfile
`- production/
   |- backend/
   |  |- php-fpm/entrypoint.sh
   |  `- worker/supervisord.conf
   |  `- php-fpm/entrypoint.sh
   `- frontend/Dockerfile
```

## Compose Files

- `compose.dev.yaml`
- `compose.prod.yaml`

## Queue Worker (supervisord)

The stack includes a dedicated Laravel queue worker service (`worker`) so queue processing runs automatically.

Queues/process count are managed by `supervisord`:

- Dev config (mounted into the container): `.docker/development/backend/worker/supervisord.conf`
- Prod config (baked into the image): `.docker/production/backend/worker/supervisord.conf` → `/etc/supervisord.conf`

After changing the config:

- Development: restart the worker container: `docker compose -f compose.dev.yaml restart worker`
- Production: rebuild + restart worker: `docker compose -f compose.prod.yaml up -d --build worker`

## Development Workflow

From the repository root:

```bash
docker compose -f compose.dev.yaml up --build -d
docker compose -f compose.dev.yaml exec workspace composer install
docker compose -f compose.dev.yaml exec workspace php artisan migrate
```

Tail worker logs:

```bash
docker compose -f compose.dev.yaml logs -f worker
```

Stop services:

```bash
docker compose -f compose.dev.yaml down
```

Stop and remove volumes:

```bash
docker compose -f compose.dev.yaml down -v
```

## Production Workflow

```bash
docker compose -f compose.prod.yaml up --build -d
```

Tail worker logs:

```bash
docker compose -f compose.prod.yaml logs -f worker
```

Stop services:

```bash
docker compose -f compose.prod.yaml down
```

## Important Environment Variables

Loaded from root `.env` (copy from `.env.example`):

- `COMPOSE_PROJECT_NAME=tiktok_clone`
- `CONTAINER_PREFIX=tiktok_clone`
- `BACKEND_ENV_FILE=./backend/.env`
- `FRONTEND_ENV_FILE=./frontend/.env`
- `NGINX_BACKEND_PORT=9696`
- `NGINX_FRONTEND_PORT=9697`
- `POSTGRES_PORT=5432`
- `POSTGRES_DB=tiktok_clone`
- `POSTGRES_USER=root`
- `POSTGRES_PASSWORD=tiktok_clone_password`
- `CORS_ALLOW_ORIGIN=*`

Frontend build/runtime variables:

- `FRONTEND_PUBLIC_API_ENDPOINT`
- `FRONTEND_PUBLIC_URL`
- `FRONTEND_PUBLIC_GOOGLE_AUTHORIZED_REDIRECT_URI`
- `FRONTEND_PUBLIC_GOOGLE_CLIENT_ID`

## Notes

- Nginx templates are rendered through the official nginx envsubst entrypoint.
