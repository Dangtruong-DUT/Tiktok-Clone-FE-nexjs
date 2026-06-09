# UC-10: Kiểm duyệt và kháng cáo (Admin)

Mô tả quy trình xử lý nội dung vi phạm từ phía quản trị viên: xem danh sách bị AI kiểm duyệt, xem chi tiết báo cáo (confidence score, nhãn), xử lý kháng cáo (phê duyệt/từ chối), khôi phục nội dung và gỡ thủ công. Phía người dùng: gửi kháng cáo.

> Hình 3.10 — Sơ đồ ca sử dụng — Kiểm duyệt và kháng cáo

```mermaid
flowchart LR
    classDef actor    fill:#dae8fc,stroke:#6c8ebf,stroke-width:2px,color:#000,font-weight:bold
    classDef adminAct fill:#ffe6cc,stroke:#d79b00,stroke-width:2px,color:#000,font-weight:bold
    classDef uc       fill:#fff2cc,stroke:#d6b656,stroke-width:1.5px,color:#000
    classDef sub      fill:#f9f0ff,stroke:#9673a6,stroke-width:1.5px,color:#000

    A(["👤 Quản trị viên"]):::adminAct
    U(["👤 Người dùng\nđã xác thực"]):::actor

    subgraph SYS["Hệ thống — Kiểm duyệt & Kháng cáo"]
        direction TB

        subgraph GRP_REVIEW["Xem & Phân tích"]
            direction TB
            UC1("Xem danh sách nội dung\nbị AI kiểm duyệt"):::uc
            UC1A("Lọc theo loại\n(bài đăng / bình luận)"):::sub
            UC2("Xem chi tiết báo cáo\nkiểm duyệt AI"):::uc
            UC2A("Xem confidence score\nvà nhãn phán quyết"):::sub
        end

        subgraph GRP_APPEAL["Xử lý kháng cáo"]
            direction TB
            UC3("Xem danh sách\nkháng cáo chờ xử lý"):::uc
            UC4("Phê duyệt kháng cáo"):::uc
            UC4A("Khôi phục nội dung\nsau phê duyệt"):::sub
            UC5("Từ chối kháng cáo"):::uc
            UC5A("Ghi lý do\ntừ chối"):::sub
        end

        subgraph GRP_MANUAL["Kiểm duyệt thủ công"]
            direction TB
            UC6("Gỡ nội dung\nthủ công"):::uc
            UC7("Gửi kháng cáo"):::uc
        end
    end

    A --> UC1 & UC2 & UC3 & UC4 & UC5 & UC6
    U --> UC7

    UC1 -.->|"«include»"| UC1A
    UC2 -.->|"«include»"| UC2A
    UC4 -.->|"«include»"| UC4A
    UC5 -.->|"«include»"| UC5A
    UC3 -.->|"«include»"| UC4
    UC3 -.->|"«include»"| UC5
    UC7 -.->|"«extend»"| UC3
```

## Ghi chú

- **Confidence score** (UC2A): giá trị từ 0–1 do mô hình PhoBERT xuất ra; ngưỡng vi phạm mặc định là 0.8 (cấu hình trong `.env`).
- **Khôi phục nội dung** (UC4A): khi admin phê duyệt kháng cáo, `is_hidden` trên bài đăng/bình luận chuyển về `false` và người dùng nhận thông báo.
- **Gửi kháng cáo** (UC7): người dùng chỉ có thể gửi kháng cáo khi nội dung có trạng thái bị ẩn; mỗi nội dung chỉ có một kháng cáo đang xử lý tại một thời điểm.
