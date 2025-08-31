# TikTok Clone Frontend

A TikTok-inspired video-sharing platform built with Next.js, TypeScript, and Tailwind CSS.

 <!-- Place your project screenshot or demo GIF below -->
 <!-- ![Project Demo](path/to/demo.png) -->

## Features

-   Infinite scrolling video feed
-   User authentication (login, signup)
-   Like, comment, and share videos
-   Follow/unfollow users
-   Search videos and profiles
-   Dark mode support
-   Internationalization (English & Vietnamese)
-   Responsive design for mobile & desktop

## Technologies

-   Next.js 15
-   React 19
-   TypeScript
-   Tailwind CSS 4
-   Redux Toolkit
-   React Query
-   next-intl
-   next-themes
-   Radix UI & Lucide Icons
-   Lottie animations
-   Zod for schema validation

## Getting Started

### Prerequisites

-   Node.js (>= 18)
-   npm, yarn, or pnpm

### Installation

1.  Clone the repo:
    ```bash
    git clone https://github.com/Dangtruong-DUT/Tiktok-Clone-FE-nextjs.git
    cd Tiktok-Clone-FE-nexjs
    ```
2.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```
3.  Create `.env.local` file in the root directory and add your environment variables:
    ```env
    NEXT_PUBLIC_API_BASE_URL=<your_api_url>
    JWT_SECRET=<your_jwt_secret>
    ```
4.  Run the development server:
    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Folder Structure

```
src/
 ├─ app/                     # Next.js App directory (pages, layout, metadata)
 ├─ components/              # Reusable React components
 ├─ hooks/                   # Custom hooks (data fetching, UI state)
 ├─ i18n/                    # Internationalization setup
 ├─ middlewares/             # Next.js middlewares (auth, routing)
 ├─ provider/                # Context and Redux providers
 ├─ services/                # API clients and request definitions
 ├─ store/                   # Redux store and slices
 ├─ utils/                   # Utility functions and helpers
 └─ …                        # other config, constants, and types
```

## Scripts

-   `npm run dev` - start development server
-   `npm run build` - build for production
-   `npm run start` - start production server
-   `npm run lint` - run ESLint

## License

Distributed under the MIT License. See `LICENSE` for more information.
