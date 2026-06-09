# UC-11: Xem báo cáo và thống kê (Admin)

Mô tả các chức năng giám sát hệ thống dành cho quản trị viên: tổng quan hệ thống, thống kê AI kiểm duyệt, thống kê upload/encoding video và theo dõi lịch sử hoạt động admin.

> Hình 3.11 — Sơ đồ ca sử dụng — Xem báo cáo và thống kê

```mermaid
flowchart LR
    classDef adminAct fill:#ffe6cc,stroke:#d79b00,stroke-width:2px,color:#000,font-weight:bold
    classDef uc       fill:#fff2cc,stroke:#d6b656,stroke-width:1.5px,color:#000
    classDef sub      fill:#f9f0ff,stroke:#9673a6,stroke-width:1.5px,color:#000

    A(["👤 Quản trị viên"]):::adminAct

    subgraph SYS["Hệ thống — Báo cáo & Thống kê"]
        direction TB

        subgraph GRP_OVERVIEW["Tổng quan hệ thống"]
            direction TB
            UC1("Xem tổng quan\nhệ thống"):::uc
            UC1A("Số người dùng\nmới / tổng"):::sub
            UC1B("Số bài đăng\nvà lượt xem"):::sub
            UC1C("Số bình luận\nđược tạo"):::sub
        end

        subgraph GRP_AI["Thống kê AI kiểm duyệt"]
            direction TB
            UC2("Xem thống kê\nAI kiểm duyệt"):::uc
            UC2A("Số bình luận / bài đăng\nđã xử lý"):::sub
            UC2B("Tỉ lệ vi phạm\ntheo thời gian"):::sub
            UC2C("Số kháng cáo\nvà tỉ lệ phê duyệt"):::sub
        end

        subgraph GRP_MEDIA["Thống kê media"]
            direction TB
            UC3("Xem thống kê\nupload video"):::uc
            UC3A("Trạng thái\nmã hóa (encoding)"):::sub
            UC3B("Dung lượng lưu trữ\nMinIO đã dùng"):::sub
        end

        subgraph GRP_LOG["Nhật ký hoạt động"]
            direction TB
            UC4("Theo dõi lịch sử\nhoạt động Admin"):::uc
            UC4A("Lọc theo\nloại hành động"):::sub
            UC4B("Xem chi tiết\ntừng hành động"):::sub
        end
    end

    A --> UC1 & UC2 & UC3 & UC4

    UC1 -.->|"«include»"| UC1A
    UC1 -.->|"«include»"| UC1B
    UC1 -.->|"«include»"| UC1C

    UC2 -.->|"«include»"| UC2A
    UC2 -.->|"«include»"| UC2B
    UC2 -.->|"«include»"| UC2C

    UC3 -.->|"«include»"| UC3A
    UC3 -.->|"«include»"| UC3B

    UC4 -.->|"«include»"| UC4A
    UC4 -.->|"«include»"| UC4B
```

## Ghi chú

- Dữ liệu tổng quan được tổng hợp từ các bảng: `users`, `posts`, `comments`, `activity_logs`.
- Thống kê AI lấy từ `ai_moderation_reports` và `appeals` — có thể lọc theo khoảng thời gian.
- **Nhật ký Admin** (UC4): ghi lại mọi hành động quan trọng (khóa user, xóa bài, xử lý kháng cáo) vào bảng `admin_logs` để audit trail.
