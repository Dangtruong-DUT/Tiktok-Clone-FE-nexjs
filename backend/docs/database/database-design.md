# Database Design

This document describes the current database schema generated from migrations in `backend/database/migrations`.

- Source of truth: Laravel migrations
- Updated: 22/03/2026
- Database engine assumptions: PostgreSQL (uses `tsvector`, GIN index, and SQL `CHECK` constraints)

---

## Core Domain Tables

### USERS

```
Table users {
  id                bigint [pk, increment]
  uuid              uuid [unique]

  name              varchar [index]
  username          varchar [unique]
  email             varchar [unique]
  password          varchar

  bio               text [null]
  location          varchar [null]
  website           varchar [null]
  date_of_birth     date [null]

  verify            tinyint [default: UNVERIFIED, index]
  role              tinyint [default: USER, index]

  avatar_file_id    bigint [null, ref: > upload_files.id, delete: set null]

  followers_count   bigint [default: 0]
  following_count   bigint [default: 0]

  search_vector     tsvector [generated always stored]

  deleted_at        timestamp [null]
  created_at        timestamp
  updated_at        timestamp
}
```

Notes:

- `search_vector` is generated from `name`, `username`, `email`, `bio`.
- GIN index: `users_search_vector_idx`.
- Constraint: `users_follow_counters_non_negative` ensures `followers_count >= 0` and `following_count >= 0`.

---

### POSTS

```
Table posts {
  id                bigint [pk, increment]
  uuid              uuid [unique]

  user_id           bigint [ref: > users.id, delete: cascade]
  content           text [null]
  type              smallint [default: POST]
  audience          smallint [default: PRIVATE]

  parent_id         bigint [null, ref: > posts.id, delete: set null]

  likes_count       bigint [default: 0]
  share_count       bigint [default: 0]
  comments_count    bigint [default: 0]
  bookmarks_count   bigint [default: 0]
  repost_count      bigint [default: 0]
  quote_post_count  bigint [default: 0]
  guest_views       bigint [default: 0]
  user_views        bigint [default: 0]

  thumbnail_file_id bigint [null, ref: > upload_files.id, delete: set null]

  search_vector     tsvector [generated always stored]

  deleted_at        timestamp [null]
  created_at        timestamp
  updated_at        timestamp
}
```

Notes:

- `search_vector` is generated from `content`.
- GIN index: `posts_search_vector_idx`.
- Constraint: `posts_counters_non_negative` ensures all counter/view columns are non-negative.

---

### UPLOAD FILES

```
Table upload_files {
  id              bigint [pk, increment]
  uuid            uuid [unique]
  file_name       varchar
  mime_type       varchar
  file_path       varchar [unique]
  disk            varchar [default: s3]
  file_size       bigint
  expired_at      timestamp [null]
  deleted_at      timestamp [null]
  created_at      timestamp
  updated_at      timestamp
}
```

---

### MEDIAS

```
Table medias {
  id              bigint [pk, increment]
  uuid            uuid [unique]
  type            smallint
  order           int [default: 0]
  post_id         bigint [ref: > posts.id, delete: cascade]
  upload_file_id  bigint [ref: > upload_files.id, delete: cascade]
  deleted_at      timestamp [null]
  created_at      timestamp
  updated_at      timestamp
}
```

---

### HASHTAGS

```
Table hashtags {
  id              bigint [pk, increment]
  name            varchar [unique]
  created_at      timestamp
  updated_at      timestamp
}
```

---

### POSTS_HASHTAGS

```
Table posts_hashtags {
  id              bigint [pk, increment]
  post_id         bigint [ref: > posts.id, delete: cascade]
  hashtag_id      bigint [ref: > hashtags.id, delete: cascade]

  indexes {
    (post_id, hashtag_id) [unique]
  }
}
```

---

### POSTS_MENTIONS

```
Table posts_mentions {
  id              bigint [pk, increment]
  post_id         bigint [ref: > posts.id, delete: cascade]
  user_id         bigint [ref: > users.id, delete: cascade]
  created_at      timestamp
  updated_at      timestamp

  indexes {
    (post_id, user_id) [unique]
  }
}
```

---

### POST_LIKES

```
Table post_likes {
  id              bigint [pk, increment]
  post_id         bigint [ref: > posts.id, delete: cascade]
  user_id         bigint [ref: > users.id, delete: cascade]
  created_at      timestamp
  updated_at      timestamp

  indexes {
    (post_id, user_id) [unique]
  }
}
```

---

### POST_BOOKMARKS

```
Table post_bookmarks {
  id              bigint [pk, increment]
  post_id         bigint [ref: > posts.id, delete: cascade]
  user_id         bigint [ref: > users.id, delete: cascade]
  created_at      timestamp
  updated_at      timestamp
}
```

---

### RELATIONSHIPS

```
Table relationships {
  id              bigint [pk, increment]
  user_id         bigint [ref: > users.id, delete: cascade]
  target_user_id  bigint [ref: > users.id, delete: cascade]
  type            smallint
  created_at      timestamp
  updated_at      timestamp

  indexes {
    (user_id, target_user_id, type) [unique]
  }
}
```

---

## Authentication Tables

### REFRESH_TOKENS

```
Table refresh_tokens {
  id              bigint [pk, increment]
  user_id         bigint [ref: > users.id, delete: cascade]
  token           varchar [unique]
  expires_at      timestamp
}
```

### EMAIL_VERIFICATIONS

```
Table email_verifications {
  id              bigint [pk, increment]
  user_id         bigint [ref: > users.id, delete: cascade]
  token           varchar [unique]
  expires_at      timestamp
}
```

### PASSWORD_RESETS

```
Table password_resets {
  id              bigint [pk, increment]
  user_id         bigint [ref: > users.id, delete: cascade]
  token           varchar [unique]
  expires_at      timestamp
}
```

---

## Framework Infrastructure Tables

These are standard Laravel runtime tables:

- `cache`
- `cache_locks`
- `jobs`
- `job_batches`
- `failed_jobs`

---

## Relationship Summary

```
Ref: users.avatar_file_id             > upload_files.id [delete: set null]

Ref: posts.user_id                    > users.id [delete: cascade]
Ref: posts.parent_id                  > posts.id [delete: set null]
Ref: posts.thumbnail_file_id          > upload_files.id [delete: set null]

Ref: medias.post_id                   > posts.id [delete: cascade]
Ref: medias.upload_file_id            > upload_files.id [delete: cascade]

Ref: posts_hashtags.post_id           > posts.id [delete: cascade]
Ref: posts_hashtags.hashtag_id        > hashtags.id [delete: cascade]

Ref: posts_mentions.post_id           > posts.id [delete: cascade]
Ref: posts_mentions.user_id           > users.id [delete: cascade]

Ref: post_likes.post_id               > posts.id [delete: cascade]
Ref: post_likes.user_id               > users.id [delete: cascade]

Ref: post_bookmarks.post_id           > posts.id [delete: cascade]
Ref: post_bookmarks.user_id           > users.id [delete: cascade]

Ref: relationships.user_id            > users.id [delete: cascade]
Ref: relationships.target_user_id     > users.id [delete: cascade]

Ref: refresh_tokens.user_id           > users.id [delete: cascade]
Ref: email_verifications.user_id      > users.id [delete: cascade]
Ref: password_resets.user_id          > users.id [delete: cascade]
```
