# Frontend (Next.js 15)

The frontend for this TikTok Clone project is built with Next.js App Router and TypeScript.

## Core Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS 4
- Redux Toolkit
- TanStack Query
- next-intl
- Storybook 9
- Vitest

## Local Setup

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Open:

- `http://localhost:3000`

## Environment Variables

In `frontend/.env`:

```env
NEXT_PUBLIC_API_ENDPOINT=http://localhost:9696/api
NEXT_PUBLIC_URL=http://localhost:9696
NEXT_PUBLIC_GOOGLE_AUTHORIZED_REDIRECT_URI=http://localhost:9696/api/auth/google/callback
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

If you run frontend and backend separately in local mode, use:

- `NEXT_PUBLIC_API_ENDPOINT=http://localhost:8000/api`
- `NEXT_PUBLIC_URL=http://localhost:3000`

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run test
npm run coverage
npm run storybook
npm run build-storybook
```

## Run with Docker Compose

From repository root:

```bash
docker compose -f compose.dev.yaml up --build -d
```

When running with Docker, access the app through Nginx:

- `http://localhost:9696`

## Storybook

Run locally:

```bash
npm run storybook
```

Default URL:

- `http://localhost:6006`
