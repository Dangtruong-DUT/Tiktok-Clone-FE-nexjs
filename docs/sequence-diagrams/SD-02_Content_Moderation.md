# SD-02: Content Moderation — Kiểm duyệt nội dung bất đồng bộ

Mô tả luồng kiểm duyệt bình luận bằng AI (PhoBERT) thông qua Kafka. Pipeline chạy hoàn toàn bất đồng bộ — Laravel API không bị block sau khi gửi message lên Kafka.

> Diagram này gộp SD-02a (tổng quan), SD-02b (PhoBERT inference), SD-02c (apply verdict) thành một luồng duy nhất, tập trung mô tả luồng chứ không mô tả chi tiết implementation.

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant API as Laravel API
    participant K as Kafka
    participant AI as AI Service (PhoBERT)
    participant CMD as Laravel Command
    participant DB as Database

    U->>FE: Gửi bình luận
    FE->>API: POST /comments
    activate API
    API->>DB: INSERT comment
    API->>K: Publish moderation.request.v1
    API-->>FE: 201 Created
    deactivate API

    Note over K,AI: Async — không block request cycle

    K->>AI: Consume moderation.request.v1
    activate AI
    AI->>AI: classify(sentence) — PhoBERT, threshold 0.8
    AI->>K: Publish moderation.result.v1 (label, confidence, is_violation)
    deactivate AI

    K->>CMD: Consume moderation.result.v1
    activate CMD

    alt is_violation = true
        CMD->>DB: BEGIN TRANSACTION
        CMD->>DB: Soft delete comment
        CMD->>DB: Tạo AiModerationReport (OPEN, appeal_deadline = now+7d)
        CMD->>DB: COMMIT
        CMD-->>U: Thông báo vi phạm (in-app + email)
    else Không vi phạm
        CMD->>DB: Tạo AiModerationReport (status=RESOLVED)
    end

    CMD->>K: Commit offset
    deactivate CMD
```

## Ghi chú

- **Kafka topics**: `moderation.request.v1` (request) → `moderation.result.v1` (result).
- **`ModerationResultProcessorCommand`** là Laravel console command chạy độc lập, **không phải** HTTP API layer.
- **Threshold 0.8**: AI Service phân loại `is_violation = true` chỉ khi `label == 1 AND confidence >= 0.8`, giảm thiểu false positive.
- **Manual commit offset**: Command chỉ commit Kafka offset sau khi xử lý thành công, đảm bảo không mất message khi có lỗi.
- **DB transaction**: Đảm bảo tính nguyên tử giữa ẩn nội dung và tạo moderation report.
- **Appeal deadline**: Người dùng có 7 ngày kể từ khi bị ẩn để gửi kháng cáo.
