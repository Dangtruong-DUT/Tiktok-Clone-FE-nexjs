# Database Design

This document outlines the database design for the TikTok Clone application, detailing the tables, relationships, and structure.

* ER Diagram: [https://dbdiagram.io/d/69b8c349fb2db18e3b970549](https://dbdiagram.io/d/69b8c349fb2db18e3b970549)
* Modified: 17/03/2026
* Author: Nguyen Dang Truong

---

## USERS

```
Table users {
  id              bigint [pk, increment]
  uuid            uuid   [unique]

  username        varchar [unique]
  email           varchar [unique]
  password        varchar

  name            varchar
  bio             text
  location        varchar
  website         varchar

  date_of_birth   date
  verify          smallint

  created_at      timestamp
  updated_at      timestamp
  deleted_at      timestamp
}
```

---

## POSTS

```
Table posts {
  id              bigint [pk, increment]
  uuid            uuid   [unique]

  user_id         bigint
  content         text
  type            smallint
  audience        smallint

  parent_id       bigint

  like_count      int
  comment_count   int
  share_count     int

  created_at      timestamp
  updated_at      timestamp
  deleted_at      timestamp

  indexes {
    (user_id, created_at)
    (parent_id)
    (created_at)
  }
}
```

---

## MEDIAS

```
Table medias {
  id              bigint [pk, increment]
  uuid            uuid   [unique]

  user_id         bigint
  post_id         bigint

  type            smallint

  created_at      timestamp
  updated_at      timestamp
  deleted_at      timestamp

  indexes {
    (post_id)
  }
}
```

---

## UPLOAD FILES (POLYMORPHIC)

```
Table upload_files {
  id              bigint [pk, increment]

  file_name       varchar
  mime_type       varchar
  file_size       bigint
  disk            varchar
  url             text

  fileable_id     bigint
  fileable_type   varchar

  created_at      timestamp
  updated_at      timestamp
  deleted_at      timestamp

  indexes {
    (fileable_id, fileable_type)
  }
}
```

---

## HASHTAGS

```
Table hashtags {
  id              bigint [pk, increment]
  name            varchar [unique]

  created_at      timestamp
  deleted_at      timestamp
}
```

---

## POST HASHTAGS

```
Table post_hashtags {
  post_id         bigint
  hashtag_id      bigint

  indexes {
    (post_id, hashtag_id) [pk]
    (hashtag_id)
  }
}
```

---

## POST MENTIONS

```
Table post_mentions {
  post_id         bigint
  user_id         bigint

  indexes {
    (post_id, user_id) [pk]
    (user_id)
  }
}
```

---

## LIKES

```
Table likes {
  user_id         bigint
  post_id         bigint

  created_at      timestamp
  deleted_at      timestamp

  indexes {
    (user_id, post_id) [pk]
    (post_id)
  }
}
```

---

## BOOKMARKS

```
Table bookmarks {
  user_id         bigint
  post_id         bigint

  created_at      timestamp
  deleted_at      timestamp

  indexes {
    (user_id, post_id) [pk]
  }
}
```

---

## RELATIONSHIPS

```
Table relationships {
  id              bigint [pk, increment]

  user_id         bigint
  target_user_id  bigint

  type            smallint

  created_at      timestamp
  deleted_at      timestamp

  indexes {
    (user_id, target_user_id, type) [unique]
    (target_user_id)
  }
}
```

---

## REFRESH TOKENS

```
Table refresh_tokens {
  id              bigint [pk, increment]
  uuid            uuid   [unique]

  user_id         bigint
  token           text

  created_at      timestamp
  deleted_at      timestamp

  indexes {
    (user_id)
  }
}
```

---

# RELATIONSHIPS

```
Ref: posts.user_id            > users.id [delete: set null, update: no action]
Ref: posts.parent_id          > posts.id [delete: cascade, update: no action]

Ref: medias.user_id           > users.id [delete: set null, update: no action]
Ref: medias.post_id           > posts.id [delete: cascade, update: no action]

Ref: post_hashtags.post_id    > posts.id [delete: cascade, update: no action]
Ref: post_hashtags.hashtag_id > hashtags.id [delete: cascade, update: no action]

Ref: post_mentions.post_id    > posts.id [delete: cascade, update: no action]
Ref: post_mentions.user_id    > users.id [delete: cascade, update: no action]

Ref: likes.user_id            > users.id [delete: cascade, update: no action]
Ref: likes.post_id            > posts.id [delete: cascade, update: no action]

Ref: bookmarks.user_id        > users.id [delete: cascade, update: no action]
Ref: bookmarks.post_id        > posts.id [delete: cascade, update: no action]

Ref: relationships.user_id        > users.id [delete: cascade, update: no action]
Ref: relationships.target_user_id > users.id [delete: cascade, update: no action]

Ref: refresh_tokens.user_id   > users.id [delete: cascade, update: no action]
```
