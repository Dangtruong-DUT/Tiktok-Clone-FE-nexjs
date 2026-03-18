# TikTok Clone 2025 - taplamit

A personal project replicating TikTok's core features, built with **Next.js (frontend)** and **Laravel 12 (backend API)** to practice full-stack development.

> Author: **Nguyen Dang Truong**

> Live Demo: [taplamit.tech](https://taplamit.tech)

---

<div align="center">

<table>
	<tr>
		<td><img width="100%" alt="Feed" src="https://github.com/user-attachments/assets/f9e678c9-0aab-4e93-8a41-5dec2d888075" /></td>
		<td><img width="100%" alt="Profile" src="https://github.com/user-attachments/assets/9e9e66f2-db3e-426d-a527-1a3409d45848" /></td>
		<td><img width="100%" alt="Video Post" src="https://github.com/user-attachments/assets/66c7f4ee-4829-490b-9fd9-89ab828ebeb9" /></td>
	</tr>
	<tr>
		<td><img width="100%" alt="Search" src="https://github.com/user-attachments/assets/89e638d8-8989-4bfe-9922-2b44981dd1ef" /></td>
		<td><img width="100%" alt="Comments" src="https://github.com/user-attachments/assets/f03c9786-de71-4298-ac11-ec54e6d16939" /></td>
		<td><img width="100%" alt="Dark Mode" src="https://github.com/user-attachments/assets/9f9734f8-4249-4475-a7b7-516a6c73a4bc" /></td>
	</tr>
	<tr>
		<td><img width="100%" alt="Mobile Responsive" src="https://github.com/user-attachments/assets/edec0df1-9917-45f3-a72a-c3a9bc5daac0" /></td>
		<td><img width="100%" alt="Internationalization" src="https://github.com/user-attachments/assets/ddfd462e-d063-4e2b-b266-3c1fb0d8cbce" /></td>
		<td><img width="1824" height="925" alt="image" src="https://github.com/user-attachments/assets/c34f86e4-2250-4766-9d09-8afdeb8a69ee" /></td>
	</tr>
</table>

</div>

---

## Features

- Infinite scrolling video feed
- User authentication (login, signup)
- Like, comment, and share videos
- Follow/unfollow users
- Search videos & profiles
- Dark mode support
- Internationalization (English & Vietnamese)
- Responsive design for mobile & desktop

## Repository Status

This repository currently runs as a monorepo with:

- Frontend: Next.js 15 (TypeScript)
- Backend: Laravel 12 API (JWT)
- Infrastructure: Docker Compose + Nginx + PostgreSQL + Redis + MinIO + MailCatcher

## Architecture Overview

- Backend Nginx (`backend-nginx`) serves the Laravel API via `php-fpm`
- Frontend Nginx (`frontend-nginx`) proxies all requests to Next.js (`frontend`)
- Background jobs (queues) are processed by Laravel queue worker (`worker`)
- Object storage is provided by MinIO (S3-compatible)
- Development email testing is handled by MailCatcher (SMTP + web UI)

Default local URLs with Docker:

- App (Frontend): `http://localhost:9697`
- API Base (Backend): `http://localhost:9696/api`
- MinIO API: `http://localhost:9000`
- MinIO Console: `http://localhost:9001`
- MailCatcher UI: `http://localhost:1080`

## Environment Strategy (Independent & Maintainable)

The repository now separates environment variables into 3 layers:

- Root `.env`: Docker Compose infrastructure variables only (ports, container names, postgres container credentials, selected env file paths)
- `backend/.env`: Laravel application variables only
- `frontend/.env`: Next.js application variables only

You can switch service env files independently by editing root `.env`:

- `BACKEND_ENV_FILE=./backend/.env`
- `FRONTEND_ENV_FILE=./frontend/.env`

## Quick Start (Docker)

1. Copy environment files:

```powershell
Copy-Item .env.example .env
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

2. Start development stack:

```bash
docker compose -f compose.dev.yaml up --build -d
```

This also starts a dedicated queue worker container (`worker`).

3. Install backend dependencies and run migrations:

```bash
docker compose -f compose.dev.yaml exec workspace composer install
docker compose -f compose.dev.yaml exec workspace php artisan migrate
```

## Queue Worker (Docker)

The repository includes a dedicated `worker` service so you don't need to run `php artisan queue:work` manually.

Development:

- Worker runs `supervisord` and loads config from `.docker/development/backend/worker/supervisord.conf` (mounted).
- Tail logs: `docker compose -f compose.dev.yaml logs -f worker`
- Restart worker: `docker compose -f compose.dev.yaml restart worker`

Production:

- Worker runs `supervisord` with `/etc/supervisord.conf` baked into the image from `.docker/production/backend/worker/supervisord.conf`.
- After changing the config, rebuild + restart: `docker compose -f compose.prod.yaml up -d --build worker`

If you need a different env profile (for example staging/production-like), update these variables in root `.env` before running compose:

- `NEXT_APP_ENV`
- `BACKEND_ENV_FILE`
- `FRONTEND_ENV_FILE`

## MinIO and MailCatcher

Root `.env` (copy from `.env.example`) contains infrastructure variables for both services:

- `MINIO_PORT`
- `MINIO_PORT_CONSOLE`
- `MINIO_ROOT_USER`
- `MINIO_ROOT_PASSWORD`
- `MAILCATCHER_WEB_PORT`
- `MAILCATCHER_SMTP_PORT`

Environment behavior:

- Development (`compose.dev.yaml`): MinIO and MailCatcher run by default.
- Production (`compose.prod.yaml`): MinIO runs by default, MailCatcher is optional and attached to profile `tools`.

Start MailCatcher in production-like stack only when required:

```bash
docker compose -f compose.prod.yaml --profile tools up -d mailcatcher
```

Recommended Docker-based backend mail/storage values in `backend/.env`:

```env
MAIL_MAILER=smtp
MAIL_HOST=mailcatcher
MAIL_PORT=1025

AWS_ACCESS_KEY_ID=minio_root_user
AWS_SECRET_ACCESS_KEY=minio_root_password
AWS_ENDPOINT=http://minio:9000
AWS_USE_PATH_STYLE_ENDPOINT=true
```

## Documentation

- Docker and Nginx: [.docker/README.md](.docker/README.md)
- Backend API: [backend/README.md](backend/README.md)
- Frontend app: [frontend/README.md](frontend/README.md)
