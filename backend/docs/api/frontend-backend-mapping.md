# Frontend ↔ Backend Mapping (JWT / User / Post / Upload)

## 1) Auth JWT contract

- `POST /auth/login`
- `POST /auth/register`
- `POST /auth/refresh-token`
- `POST /auth/verify-email`

Response tokens:

- `data.access_token`: JWT, claim `token_type = 0`
- `data.refresh_token`: JWT, claim `token_type = 1`

Required claims used by frontend:

- `user_id` (UUID string)
- `uuid` (UUID string)
- `verify` (enum int)
- `role` (enum int)
- `token_type` (`0` access, `1` refresh)
- `exp`, `iat`

Refresh-token behavior:

- Refresh token is validated by JWT payload + DB hash record.
- On refresh, backend rotates refresh token (old token revoked, new refresh token issued).

## 2) Identifier rules

- Public profile endpoint uses `username`: `GET /users/{username}`.
- Post/user action routes use `uuid`:
    - `/posts/{post_uuid}`
    - `/users/{user_uuid}/follow`
    - `/users/{user_uuid}/posts|like|bookmark`
- Internal relation in create/update payload may still require numeric IDs:
    - `parent_id` (post numeric id)
    - `thumbnail` (upload file numeric id)
    - `medias[*].file_id` (upload file numeric id)

## 3) Post list/query rules

Mandatory note:

- List endpoints require query `type` mapped to backend `post_type` validation.

Applied routes:

- `GET /posts?page=&per_page=&type=`
- `GET /posts/{post_uuid}/children?page=&per_page=&type=`
- `GET /users/{user_uuid}/posts?page=&per_page=&type=`
- `GET /users/{user_uuid}/like?page=&per_page=&type=`
- `GET /users/{user_uuid}/bookmark?page=&per_page=&type=`

## 4) Upload + create/update payload

Upload:

- `POST /medias/upload-image`
- `POST /medias/upload-video`
- response `data` is single object `{ id, url, type }`

Create post payload:

- `type`, `audience`, `content`
- `medias: [{ file_id, type }]`
- `thumbnail` (optional, upload file id)
- `hashtags`, `mentions`, `parent_id` per business case

Update post payload:

- `audience`, `content`, `hashtags`, `mentions`, `thumbnail`
- route param uses `post_uuid`

## 5) Pagination envelope (backend standard)

List responses use API envelope meta:

- `meta.current_page`
- `meta.last_page`
- `meta.per_page`
- `meta.total` (offset pagination)
- `meta.next_page_url`, `meta.prev_page_url`
