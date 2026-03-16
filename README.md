# TikTok Clone 2025 - taplamit

A personal project replicating TikTok's core features, built with **Next.js (frontend)** and **Node.js + TypeScript + Express.js (backend)** to practice full-stack development.

> Author: **Nguyễn Đăng Trường**

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

## Technologies

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178c6?logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38B2AC?logo=tailwind-css)
![Redux Toolkit](https://img.shields.io/badge/Redux%20Toolkit-%20-%23764ABC?logo=redux)
![TanStack Query](https://img.shields.io/badge/TanStack%20Query-4-FF4154?logo=react-query)
![React Intl](https://img.shields.io/badge/next--intl-%20-blue?logo=react)
![Shadcn/ui](https://img.shields.io/badge/shadcn/ui-%20-8E8E93?logo=react)
![Radix UI](https://img.shields.io/badge/radix%20ui-%20-5E5E5E?logo=react)
![Lottie](https://img.shields.io/badge/lottie-%20-1ABC9C?logo=lottie)
![Zod](https://img.shields.io/badge/zod%20validation-%20-6E4AFF?logo=zod)
![Vercel](https://img.shields.io/badge/Vercel-%20-000000?logo=vercel)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js)
![Express.js](https://img.shields.io/badge/Express.js-%20-404D59?logo=express)
![Docker](https://img.shields.io/badge/Docker-%20-2496ED?logo=docker)

## Folder Structure

```
src/
 ├── app/          # Next.js App directory (pages, layout, metadata)
 ├── components/   # Reusable React components
 ├── hooks/        # Custom hooks (data fetching, UI state)
 ├── i18n/         # Internationalization setup
 ├── middlewares/  # Next.js middlewares (auth, routing)
 ├── provider/     # Context and Redux providers
 ├── services/     # API clients and request definitions
 ├── store/        # Redux store and slices
 ├── utils/        # Utility functions and helpers
 └── ...           # Other config, constants, and types
```

## Getting Started

### Prerequisites

- Node.js (>= 18)
- npm, yarn, or pnpm

### Installation

1. **Clone the repo:**
    ```bash
    git clone https://github.com/Dangtruong-DUT/Tiktok-Clone-FE-nextjs.git
  cd Tiktok-Clone-FE-nextjs
    ```
2. **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```
3. **Create `.env` (or `.env.local`) in the root and add:**
  > You can start by copying `.env.example`.
  ```env
  # Backend API base URL (used by RTK Query + REST clients)
  NEXT_PUBLIC_API_ENDPOINT=http://localhost:8080

  # Frontend base URL (used for sitemap/canonical/share links)
  NEXT_PUBLIC_URL=http://localhost:3000

  # Google OAuth
  NEXT_PUBLIC_GOOGLE_AUTHORIZED_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
  NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id

  # Optional (defaults to "production" if omitted)
  NEXT_APP_ENV=development
  ```
4. **Run the development server:**
    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Scripts

- `npm run dev` — start development server
- `npm run build` — build for production
- `npm run start` — start production server
- `npm run lint` — run ESLint

## Docker

This repo includes Docker setup for both development and production.

> Note: `NEXT_PUBLIC_*` variables are embedded at build time in production. Make sure your `.env` values are set before building the production image.

### Development

```bash
docker compose -f compose.dev.yaml up --build
```

Open http://localhost:3000

### Production

```bash
docker compose -f compose.pro.yaml up --build -d
```

Open http://localhost

## Topics

`react` `redux` `typescript` `tailwindcss` `tiktok` `tiktok-api` `redux-toolkit` `vercel` `next-intl` `rtkquery` `tanstack-table` `shadcn-ui` `tiktokclone` `zod-validation` `nextjs15` `tanstack-query` `taplamit`

## License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for more information.

---
