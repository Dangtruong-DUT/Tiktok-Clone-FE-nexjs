# SD-03a: Video Upload — Multipart Upload qua Presigned URL

Mô tả luồng người dùng tải video lên. Frontend upload chunk trực tiếp lên MinIO S3 qua presigned URL — Laravel API không xử lý data stream, chỉ cấp phát URL và quản lý metadata.

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant API as Laravel API
    participant S3 as MinIO S3

    U->>FE: Chọn file video
    FE->>API: POST /videos/upload-sessions (file_name, file_size, mime_type)
    activate API
    API->>API: Tạo VideoUploadSession (PENDING)
    API->>S3: initiateMultipartUpload(key, mimeType)
    S3-->>API: upload_id
    API-->>FE: session_uuid, upload_id
    deactivate API

    loop Mỗi chunk
        FE->>API: GET /videos/upload-sessions/{uuid}/parts/{n}
        activate API
        API->>S3: presignedPartUrl(key, upload_id, n)
        S3-->>API: presigned_url
        API-->>FE: presigned_url
        deactivate API
        FE->>S3: PUT chunk trực tiếp
        S3-->>FE: ETag
    end

    FE->>API: PUT /videos/upload-sessions/{uuid}/complete (parts list + ETags)
    activate API
    API->>S3: completeMultipartUpload(key, upload_id, parts)
    API->>S3: objectExists(key) — xác minh file tồn tại
    API->>API: Tạo UploadFile record
    API->>API: Session → UPLOADED, Encoding → PENDING
    API->>API: Dispatch ProcessVideoToHlsJob (queue: video-processing)
    API-->>FE: status: UPLOADED, encoding: PENDING
    deactivate API

    FE-->>U: Upload hoàn tất — đang xử lý video...
```

## Ghi chú

- **Chunk upload** đi trực tiếp **Frontend → MinIO**, không đi qua Laravel API. Laravel chỉ cấp presigned URL và quản lý metadata.
- **Session states**: `PENDING` → `UPLOADED` (khi complete thành công) → `ANALYZING` → `TRANSCODING` → `READY` (xem SD-03b).
- Sau khi dispatch job, session không chuyển sang `READY` ngay — trạng thái tiếp tục được cập nhật bởi queue worker (SD-03b).
