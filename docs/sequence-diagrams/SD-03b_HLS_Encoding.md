# SD-03b: HLS Encoding — Xử lý video thành HLS

Mô tả luồng queue worker xử lý video raw thành HLS (HTTP Live Streaming) với nhiều variant chất lượng. Đây là phần tiếp nối sau khi SD-03a dispatch `ProcessVideoToHlsJob`.

```mermaid
sequenceDiagram
    participant W as Queue Worker
    participant API as Laravel API
    participant S3 as MinIO S3
    participant FE as Frontend

    W->>API: ProcessVideoToHlsJob (tries=3, timeout=7200s, backoff=[60,300,900]s)
    activate API
    API->>API: Session → ANALYZING, Encoding → PROCESSING (0%)
    API-->>FE: SSE/WS: encoding started

    API->>S3: Download raw video → /tmp/{uuid}/input.mp4
    API->>API: ffprobe — lấy thông tin video (width, height, duration)
    API->>API: Chọn variants phù hợp (size ≤ kích thước nguồn, tránh upscaling)
    API->>API: Session → TRANSCODING

    loop Mỗi variant (360p, 480p, 720p, 1080p…)
        API->>API: FFmpeg encode → .ts segments + index.m3u8
        API->>API: Cập nhật progress
        API-->>FE: SSE/WS: progress update
    end

    API->>API: Build master.m3u8
    API->>S3: Upload HLS files → hls/{uuid}/
    API->>API: Session → READY, Encoding → READY (100%)
    API->>API: Cleanup /tmp/{uuid}/
    API-->>FE: SSE/WS: encoding done
    deactivate API

    alt Lỗi xảy ra
        activate API
        API->>API: Encoding → FAILED
        API-->>FE: SSE/WS: encoding failed
        deactivate API
        W->>W: Retry (backoff: 60s → 300s → 900s)
    end
```

## Ghi chú

- **Session state progression**: `UPLOADED` → `ANALYZING` (download + probe) → `TRANSCODING` (FFmpeg encode) → `READY`.
- **Không upscale**: Chỉ encode các variant có kích thước **≤** kích thước nguồn. Video 480p sẽ không được encode lên 720p.
- **Retry**: Job thử lại tối đa 3 lần với backoff tăng dần (60s → 300s → 900s).
- **`VideoProcessingService`** và **`FFmpegService`** là internal class của worker — không phải service riêng biệt.
- **SSE/WS progress**: Frontend nhận cập nhật tiến trình real-time qua WebSocket hoặc SSE trong suốt quá trình encode.
