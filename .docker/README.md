# Docker Guide

This document describes the Docker setup used by the tiktok-clone monorepo.

## Goals

- Keep development and production environments consistent
- Separate frontend, backend, database, and cache services clearly
- Use a centralized and maintainable Nginx configuration

## Nginx Organization (Decoupled from Backend)

Nginx is now organized in a dedicated shared module instead of a backend-specific folder:

- `./.docker/common/nginx/templates/nginx.conf.template`
- `./.docker/common/nginx/templates/conf.d/tiktok-clone.conf.template`
- `./.docker/common/nginx/templates/snippets/cors-api.conf.template`

This structure is used by both environments:

- Development: mounted by `compose.dev.yaml` into `/etc/nginx/templates`
- Production: copied by `.docker/production/backend/nginx/Dockerfile`

## Directory Structure

```text
.docker/
|- common/
|  |- nginx/
|  |  `- templates/
|  |     |- nginx.conf.template
|  |     |- conf.d/tiktok-clone.conf.template
|  |     `- snippets/cors-api.conf.template
|  `- backend/
|     `- php-fpm/
|        |- Dockerfile
|        `- conf.d/
|- development/
|  |- backend/
|  |  |- php-fpm/entrypoint.sh
|  |  `- workspace/Dockerfile
|  `- frontend/Dockerfile
`- production/
   |- backend/
   |  |- nginx/Dockerfile
   |  `- php-fpm/entrypoint.sh
   `- frontend/Dockerfile
```

## Compose Files

- `compose.dev.yaml`
- `compose.prod.yaml`

## Development Workflow

From the repository root:

```bash
docker compose -f compose.dev.yaml up --build -d
docker compose -f compose.dev.yaml exec workspace composer install
docker compose -f compose.dev.yaml exec workspace php artisan migrate
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
- `NGINX_PORT=9696`
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
