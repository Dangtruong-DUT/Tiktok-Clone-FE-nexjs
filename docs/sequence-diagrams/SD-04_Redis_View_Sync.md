# SD-04: Redis View Count — Đếm lượt xem và đồng bộ về DB

Mô tả luồng đếm lượt xem video dùng Redis làm fast path (không block request), sau đó batch sync về PostgreSQL định kỳ mỗi 1 phút.

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant API as Laravel API
    participant R as Redis
    participant SCH as Laravel Scheduler
    participant DB as PostgreSQL

    U->>FE: Xem video
    FE->>API: GET /posts/{uuid}
    activate API
    API->>R: SETNX post:view:lock:{postId}:{viewerKey}

    alt Lock tồn tại — chống spam 60s
        API-->>FE: 200 OK (bỏ qua lượt xem)
    else View hợp lệ
        API->>R: EXPIRE lock_key 60s
        API->>R: INCR post:view:user:{postId}
        API->>R: INCR post:view:guest:{postId}
        API->>R: SADD post:view:posts {postId}
        API-->>FE: 200 OK (post data)
    end

    deactivate API

    Note over SCH: Chạy mỗi 1 phút (withoutOverlapping)

    SCH->>R: SMEMBERS post:view:posts

    loop Mỗi postId
        SCH->>R: GET post:view:user:{postId}
        SCH->>R: GET post:view:guest:{postId}
        SCH->>DB: BEGIN TRANSACTION
        SCH->>DB: incrementViews(postId, userViews, guestViews)
        SCH->>R: DEL post:view:user:{postId}
        SCH->>R: DEL post:view:guest:{postId}
        SCH->>R: SREM post:view:posts {postId}
        SCH->>DB: COMMIT
    end
```

## Ghi chú

- **viewerKey**: `user:{userId}` cho người dùng đã đăng nhập; `guest:sha1(ip|userAgent)` cho khách.
- **Anti-spam**: `SETNX` + `EXPIRE 60s` đảm bảo mỗi viewer chỉ được tính 1 lượt/phút cho mỗi video.
- **Tách user/guest**: Hai key riêng (`post:view:user`, `post:view:guest`) để phân tích thống kê theo nhóm.
- **Redis là fast path**: API chỉ ghi vào Redis, không block vì I/O database trong request cycle.
- **Scheduler**: `posts:sync-views` command chạy với `withoutOverlapping()` — không chạy đồng thời nhiều instance.
- Lượt xem được hiển thị theo giá trị Redis (real-time) hoặc DB tùy context, chênh lệch tối đa ~1 phút.
