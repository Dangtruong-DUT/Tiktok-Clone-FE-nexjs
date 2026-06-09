# SD-03a: Video Upload — Multipart Upload qua Presigned URL

Mô tả luồng người dùng tải video lên. Frontend upload chunk trực tiếp lên MinIO S3 qua presigned URL — Laravel API không xử lý data stream, chỉ cấp phát URL và quản lý metadata.

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant API as Laravel API
    participant S3 as MinIO S3
    participant DB as Database
    participant W as Queue Worker

    U->>FE: Chọn file video
    FE->>API: POST /videos/upload-sessions (file_name, file_size, mime_type)
    activate API
    API->>DB: INSERT VideoUploadSession (PENDING)

    alt file_size < threshold — SINGLE upload
        API->>S3: presignedPutUrl(key, ttl)
        S3-->>API: presigned_url
        API-->>FE: session_uuid, upload_type:single, presigned_url, chunk_size_bytes
        deactivate API

        FE->>S3: PUT file trực tiếp (1 request)
        S3-->>FE: 200 OK

    else file_size >= threshold — MULTIPART upload
        API->>S3: initiateMultipartUpload(key, mimeType)
        S3-->>API: upload_id
        API->>DB: UPDATE session — lưu upload_id
        API-->>FE: session_uuid, upload_type:multipart, upload_id, chunk_size_bytes
        deactivate API

        loop Mỗi chunk (S3 không cần biết tổng số part)
            FE->>API: GET /videos/upload-sessions/{uuid}/parts/{n}
            activate API
            API->>S3: presignedPartUrl(key, upload_id, n)
            S3-->>API: presigned_url
            API-->>FE: presigned_url
            deactivate API
            FE->>S3: PUT chunk trực tiếp
            S3-->>FE: ETag
        end
    end

    FE->>API: PUT /videos/upload-sessions/{uuid}/complete (parts:[{n, ETag}])
    activate API
    API->>S3: completeMultipartUpload(key, upload_id, parts)
    API->>S3: objectExists(key) — xác minh file tồn tại
    API->>DB: INSERT UploadFile record
    API->>DB: INSERT VideoEncoding (PENDING)
    API->>DB: UPDATE session → UPLOADED
    API->>W: Dispatch ProcessVideoToHlsJob (queue: video-processing)
    API-->>FE: status: UPLOADED, encoding_status: PENDING
    deactivate API

    FE-->>U: Upload hoàn tất — đang xử lý video...

    Note over W: Worker nhận job và bắt đầu HLS encoding (xem SD-03b)
    activate W
    W->>DB: UPDATE session → ANALYZING
    W->>W: ...encode HLS (SD-03b)
    deactivate W
```

## Ghi chú

- **Chunk upload** đi trực tiếp **Frontend → MinIO**, không đi qua Laravel API. Laravel chỉ cấp presigned URL và quản lý metadata.
- **Session states**: `PENDING` → `UPLOADED` (khi complete thành công) → `ANALYZING` → `TRANSCODING` → `READY` (xem SD-03b).
- Sau khi dispatch job, session không chuyển sang `READY` ngay — trạng thái tiếp tục được cập nhật bởi queue worker (SD-03b).
