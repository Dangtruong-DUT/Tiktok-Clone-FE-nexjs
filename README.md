# TikTok Clone 2025 - taplamit

A personal project replicating TikTok's core features, built with **Next.js (frontend)** and **Node.js + TypeScript + Express.js (backend)** to practice full-stack development.

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
- Infrastructure: Docker Compose + Nginx + PostgreSQL + Redis

## Architecture Overview

- Nginx (`web-server`) is the public entrypoint
- `/api/*` routes are forwarded to Laravel (`php-fpm`)
- All other routes are proxied to Next.js (`frontend`)

Default local URLs with Docker:

- App: `http://localhost:9696`
- API Base: `http://localhost:9696/api`

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

3. Install backend dependencies and run migrations:

```bash
docker compose -f compose.dev.yaml exec workspace composer install
docker compose -f compose.dev.yaml exec workspace php artisan migrate
```

## Documentation

- Docker and Nginx: [.docker/README.md](.docker/README.md)
- Backend API: [backend/README.md](backend/README.md)
- Frontend app: [frontend/README.md](frontend/README.md)
