# UC-05: Cá nhân hóa

Mô tả các chức năng giúp người dùng tùy chỉnh trải nghiệm: theo dõi/bỏ theo dõi, đánh dấu bài đăng, quản lý bookmark, thiết lập giới hạn sức khỏe số qua AI phân tích ngôn ngữ tự nhiên, và xem thống kê thời gian sử dụng.

> Hình 3.5 — Sơ đồ ca sử dụng — Cá nhân hóa

```mermaid
flowchart LR
    classDef actor fill:#dae8fc,stroke:#6c8ebf,stroke-width:2px,color:#000,font-weight:bold
    classDef uc     fill:#fff2cc,stroke:#d6b656,stroke-width:1.5px,color:#000
    classDef sub    fill:#f9f0ff,stroke:#9673a6,stroke-width:1.5px,color:#000
    classDef ext    fill:#d5e8d4,stroke:#82b366,stroke-width:2px,color:#000,font-weight:bold

    U(["👤 Người dùng\nđã xác thực"]):::actor

    subgraph SYS["Hệ thống — Cá nhân hóa"]
        direction TB

        subgraph GRP_SOCIAL["Quan hệ xã hội"]
            direction TB
            UC1("Theo dõi\nngười dùng khác"):::uc
            UC2("Bỏ theo dõi\nngười dùng"):::uc
        end

        subgraph GRP_BOOKMARK["Đánh dấu nội dung"]
            direction TB
            UC3("Đánh dấu\nbài đăng"):::uc
            UC4("Bỏ đánh dấu\nbài đăng"):::uc
            UC5("Quản lý danh sách\nbookmark"):::uc
        end

        subgraph GRP_WELLNESS["Sức khỏe số"]
            direction TB
            UC6("Thiết lập giới hạn\nsức khỏe số"):::uc
            UC6A("AI phân tích\nngôn ngữ tự nhiên"):::sub
            UC6B("Cấu hình quy tắc\nthời gian sử dụng"):::sub
            UC7("Xem thống kê\nthời gian sử dụng"):::uc
        end
    end

    AI(["⚙️ AI Service\n(Gemini)"]):::ext

    U --> UC1 & UC2
    U --> UC3 & UC4 & UC5
    U --> UC6 & UC7

    UC6 -.->|"«include»"| UC6A
    UC6 -.->|"«include»"| UC6B
    UC6A --> AI
```

## Ghi chú

- **Thiết lập giới hạn sức khỏe số**: người dùng mô tả mục tiêu bằng ngôn ngữ tự nhiên (ví dụ: "Nhắc tôi nghỉ sau 2 giờ dùng mỗi ngày") — AI phân tích và chuyển thành quy tắc cấu trúc.
- **Thống kê thời gian** (UC7): tổng hợp từ `screen_time_sessions` — hiển thị theo ngày/tuần với biểu đồ sử dụng.
- Bookmark được ẩn riêng tư theo mặc định; người dùng có thể chuyển sang công khai trong cài đặt quyền riêng tư.
