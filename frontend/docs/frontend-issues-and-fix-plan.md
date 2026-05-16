# Frontend Issues and Fix Plan (May 16, 2026)

## Scope

- Quick architecture + security review of the frontend auth flow, middleware, API clients, and key UI components.
- This is a static inspection (no runtime testing executed yet).

## Critical Security Issues

1. Tokens stored in localStorage

- Evidence: src/services/storage/clientSessionToken.ts
- Risk: XSS can exfiltrate access/refresh tokens and fully hijack accounts.
- Fix: Remove token storage from localStorage. Use httpOnly cookies only.

2. Access token placed in query string on redirect

- Evidence: src/apis/client.ts
- Risk: Token leakage via logs, browser history, referrer headers.
- Fix: Remove token from query params. Use a logout endpoint that reads cookies.

3. JWT decoded without verification for auth decisions

- Evidence: src/utils/auth/jwt.util.ts, src/middlewares/role-check.middleware.ts, src/middlewares/banned-user.middleware.ts
- Risk: Role/banned checks can be spoofed if token is tampered or stale.
- Fix: Do not trust decoded JWT for access control. Enforce on backend; use /me for UI state only.

4. Two sources of truth for auth (cookie vs localStorage)

- Evidence: src/utils/auth/token.util.ts + src/services/storage/clientSessionToken.ts
- Risk: Desync between server auth and client state; inconsistent access rules.
- Fix: Use cookie-only and fetch /me to hydrate client state.

## Medium Priority Issues

1. Refresh middleware only checks presence of token

- Evidence: src/middlewares/auth.middleware.ts
- Risk: Expired access token can still be treated as valid.
- Fix: Validate exp server-side or rely on backend and /me.

2. Logout does not clear user_profile in Redux

- Evidence: src/store/features/authSlice.ts
- Risk: Stale user info displayed after logout.
- Fix: Clear user_profile on logout.

3. Auth rehydrate uses access token without exp check

- Evidence: src/provider/app-provider.tsx
- Risk: Role and state derived from expired token.
- Fix: Replace with /me call or server-hydrated session.

## Maintainability / Architecture Issues

1. Duplicate video players (v1, v2, v3)

- Evidence: src/components/video-player, video-player-v2, video-player-v3
- Risk: Bug fixes must be applied in 3 places; inconsistent behavior.
- Fix: Extract a shared core component + variants.

2. File name case mismatch and className bug

- Evidence: src/components/account-Item.tsx
- Risk: Case-sensitive FS issues; className not applied.
- Fix: Rename to account-item.tsx and fix cn() usage.

3. Deprecated Next Image API usage

- Evidence: src/components/video-player-v2/index.tsx, video-player-v3/index.tsx
- Risk: Warnings + future breakage.
- Fix: Replace layout='fill' with fill prop and proper sizes.

4. useDebounce uses any with lint disabled

- Evidence: src/hooks/shared/useDebounce.ts
- Risk: Type safety loss.
- Fix: Make it generic.

5. App Router + pages/\_document

- Evidence: src/pages/\_document.tsx
- Risk: Confusing architecture; potential double setup.
- Fix: Confirm if pages/ is still needed; remove if not.

## Target Auth Architecture (Chosen)

- Laravel accepts access_token from httpOnly cookie when Authorization header is missing.
- Client calls backend directly with credentials: 'include'.
- No access/refresh token is stored or read in JS.

### Backend (Laravel) Changes

1. Add cookie-to-bearer bridge

- If Authorization header missing, read access_token from cookie and authenticate.

2. Ensure auth endpoints set/clear cookies

- login/register/refresh: set httpOnly cookies (access_token, refresh_token)
- logout: clear cookies

3. CORS + credentials

- Allow frontend origin(s)
- Access-Control-Allow-Credentials: true
- Ensure SameSite and secure flags work for dev/prod

4. Optional: Stop returning tokens in JSON responses

### Frontend Changes

1. Remove localStorage token usage

- Deprecate clientSessionToken storage.

2. Use credentials include for all backend requests

- fetchBaseQuery({ baseUrl, credentials: 'include' })
- For any custom fetch, add credentials: 'include'

3. Rehydrate auth state via /me

- On app load, call /users/me (backend) to get user + role
- Store user/role in Redux; no tokens in JS

4. Remove access token from query string

- Replace logout redirect with POST /auth/logout

5. Reduce client-side auth gates

- Middleware should only check presence of refresh cookie at most
- Role/banned checks should be enforced in Laravel

## Migration Plan (Phased)

Phase 0: Backend readiness

- Implement cookie-based auth extraction
- Confirm CORS + SameSite/secure settings for dev/prod

Phase 1: Frontend switch to credentialed requests

- Update base query and custom fetch to include credentials
- Add /me rehydrate logic

Phase 2: Remove token storage in JS

- Remove clientSessionToken usage
- Update auth middleware and logout flow

Phase 3: Cleanup and refactors

- Remove duplicate video player code
- Fix account-item filename and className bug
- Replace deprecated Next Image API
- Improve useDebounce typing

## Test Checklist

- Login sets httpOnly cookies
- Authenticated API calls succeed without Authorization header
- Refresh works when access token expires
- Logout clears cookies and user state
- Role-based routes enforced by backend
- CORS + credentials in dev and prod
- XSS: tokens not readable via JS

## Open Questions

- Are frontend and backend served under the same domain in prod? đúng rồi
- What are the exact dev/prod cookie domains and SameSite policies? ok
- Do we want to keep Next /api routes as a fallback BFF? không
