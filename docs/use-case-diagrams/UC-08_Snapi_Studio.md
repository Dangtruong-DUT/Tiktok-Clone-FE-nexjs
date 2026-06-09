# UC-08: Quản lý bài đăng — Snapi Studio

Mô tả các chức năng trong Snapi Studio dành cho người tạo nội dung: tải lên video (multipart upload trực tiếp lên MinIO), chỉnh sửa bài đăng, lên lịch, quản lý nháp, sử dụng AI Copilot và gửi kháng cáo.

> Hình 3.8 — Sơ đồ ca sử dụng — Quản lý bài đăng (Snapi Studio)

```mermaid
flowchart LR
    classDef actor fill:#dae8fc,stroke:#6c8ebf,stroke-width:2px,color:#000,font-weight:bold
    classDef uc     fill:#fff2cc,stroke:#d6b656,stroke-width:1.5px,color:#000
    classDef sub    fill:#f9f0ff,stroke:#9673a6,stroke-width:1.5px,color:#000
    classDef ext    fill:#d5e8d4,stroke:#82b366,stroke-width:2px,color:#000,font-weight:bold

    U(["👤 Người dùng\nđã xác thực\n(Content Creator)"]):::actor

    subgraph SYS["Hệ thống — Snapi Studio"]
        direction TB

        subgraph GRP_UPLOAD["Tải lên & Chỉnh sửa"]
            direction TB
            UC1("Tải lên video"):::uc
            UC1A("Multipart upload\ntrực tiếp lên MinIO"):::sub
            UC1B("Theo dõi tiến trình\nmã hóa video"):::sub
            UC2("Chỉnh sửa thông tin\nbài đăng"):::uc
            UC2A("Cập nhật caption\nvà hashtag"):::sub
            UC2B("Chọn thumbnail\nvà đối tượng xem"):::sub
        end

        subgraph GRP_SCHEDULE["Lên lịch & Nháp"]
            direction TB
            UC3("Lên lịch đăng bài"):::uc
            UC4("Quản lý bài nháp"):::uc
            UC5("Quản lý bài\nđã lên lịch"):::uc
        end

        subgraph GRP_AI["AI Copilot"]
            direction TB
            UC6("Sử dụng\nAI Copilot"):::uc
            UC6A("Gợi ý caption\nvà hashtag"):::sub
            UC6B("Phân tích viral /\nhook / retention"):::sub
            UC6C("Phân tích khung hình\nvà đoạn video"):::sub
        end

        subgraph GRP_APPEAL["Kháng cáo"]
            direction TB
            UC7("Gửi kháng cáo\nkhi nội dung bị kiểm duyệt"):::uc
        end
    end

    MINIO(["⚙️ MinIO\n(S3-compatible)"]):::ext
    AI(["⚙️ AI Service\n(Gemini)"]):::ext

    U --> UC1 & UC2 & UC3 & UC4 & UC5
    U --> UC6 & UC7

    UC1 -.->|"«include»"| UC1A
    UC1 -.->|"«include»"| UC1B
    UC2 -.->|"«include»"| UC2A
    UC2 -.->|"«include»"| UC2B

    UC6 -.->|"«include»"| UC6A
    UC6 -.->|"«include»"| UC6B
    UC6 -.->|"«include»"| UC6C

    UC1A --> MINIO
    UC6A & UC6B & UC6C --> AI
```

## Ghi chú

- **Multipart upload** (UC1A): client chia video thành các part, upload trực tiếp lên MinIO — backend chỉ khởi tạo và hoàn thành session, không trung gian luồng dữ liệu.
- **Mã hóa video** (UC1B): sau khi upload xong, backend enqueue job mã hóa; trạng thái theo dõi qua `VideoEncoding` model.
- **AI Copilot** (UC6): giao tiếp qua SSE stream — kết quả được trả dần về UI trong thời gian thực.
- **Kháng cáo** (UC7): chỉ khả dụng khi bài đăng có trạng thái bị kiểm duyệt (`is_hidden = true`).
