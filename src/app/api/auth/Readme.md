# 📂 app/api/auth

This folder contains the **Next.js Server API Routes** for handling **authentication** in this project.
The Next.js server here **acts as a secure proxy** between the **frontend (browser)** and the **backend server**, managing **JWT-based session control** using both `accessToken` and `refreshToken`.

## 🔑 How it works

-   The Next.js server always acts as an **authentication proxy**:
    -   It accepts **login**, **logout**, and **refresh token** requests from the client.
    -   It forwards these requests to the backend server.
    -   It returns the backend’s exact response payload to the client **and** securely sets HTTP-only cookies (`accessToken`, `refreshToken`).

## ⏰ Session Expiration

-   Token expiry (`expireAt`) is determined using the `exp` claim (epoch time) from the backend token payload.
-   Because there can be a **slight time drift** between the backend and the client (about 0.5–1 second), the client should **subtract ~1 second** to avoid accidental expiry overlap.
-   The client has a **`setInterval`** or similar logic:
    -   If logged in, it will **auto-refresh** the token if the `accessToken` lifetime is less than **1/3 of its total duration**.
    -   This refresh request **always** goes through the Next.js server to ensure tokens stay in sync.

## 🔐 Always Through Next.js

-   **Login session handling** (`set cookie`, `clear cookie`) **must** run on the Next.js server.
-   Any **middleware** in this app should:
    -   Check `accessToken` validity.
    -   If expired but `refreshToken` is still valid, **redirect** the user to a dedicated refresh route.
    -   If both tokens fail, force logout (using the HTTP client in `src/services/api/http.ts`) which calls the logout API to clear cookies and local storage.

## ⚙️ Why this matters

-   Centralizing auth in the Next.js server:
    -   Improves security: tokens are handled in secure HTTP-only cookies.
    -   Prevents direct exposure of backend endpoints to the browser.
    -   Keeps the frontend logic simple — all session checks and renewals **always flow through the Next.js API**.

## ✅ Key Points

-   **Next.js server = proxy for login/logout/refresh**
-   Cookies are set **server-side** only.
-   Expiration logic uses `exp` from token but subtracts ~1s buffer.
-   Session auto-renew uses a client `setInterval`.
-   Middleware **forces proper flow** and redirects if needed.
-   The `http.ts` services guarantees logout if `401` occurs unexpectedly.

This ensures your authentication stays robust, secure, and easy to maintain.

**Author:** TaplamIT-ndtrg281
**Updated:** 2025
