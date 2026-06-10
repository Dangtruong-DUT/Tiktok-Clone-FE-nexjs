# UC-09: Quản lý người dùng hệ thống (Admin)

Mô tả các chức năng của Quản trị viên trong việc quản lý tài khoản người dùng: xem danh sách, khóa/mở khóa với thời hạn tùy chỉnh, xem lịch sử hoạt động và gửi thông báo trực tiếp.

> Hình 3.9 — Sơ đồ ca sử dụng — Quản lý người dùng hệ thống

```mermaid
flowchart LR
    classDef actor    fill:#ffe6cc,stroke:#d79b00,stroke-width:2px,color:#000,font-weight:bold
    classDef uc       fill:#fff2cc,stroke:#d6b656,stroke-width:1.5px,color:#000
    classDef sub      fill:#f9f0ff,stroke:#9673a6,stroke-width:1.5px,color:#000

    A(["👤 Quản trị viên"]):::actor

    subgraph SYS["Hệ thống — Quản lý người dùng (Admin)"]
        direction TB

        subgraph GRP_LIST["Duyệt danh sách"]
            direction TB
            UC1("Xem danh sách\nngười dùng"):::uc
            UC1A("Tìm kiếm và\nlọc người dùng"):::sub
            UC2("Xem chi tiết\nhồ sơ người dùng"):::uc
        end

        subgraph GRP_BAN["Khóa / Mở khóa tài khoản"]
            direction TB
            UC3("Khóa tài khoản"):::uc
            UC3A("Khóa tạm thời\n(có thời hạn)"):::sub
            UC3B("Khóa vĩnh viễn"):::sub
            UC4("Mở khóa tài khoản"):::uc
        end

        subgraph GRP_HISTORY["Giám sát"]
            direction TB
            UC5("Xem lịch sử\nhoạt động người dùng"):::uc
            UC5A("Xem nhật ký\nlog bài đăng / bình luận"):::sub
        end

        subgraph GRP_NOTIFY["Thông báo"]
            direction TB
            UC6("Gửi thông báo Admin\nđến người dùng cụ thể"):::uc
        end
    end

    A --> UC1 & UC2
    A --> UC3 & UC4
    A --> UC5
    A --> UC6

    UC1 -.->|"«include»"| UC1A
    UC3 -.->|"«include»"| UC3A
    UC3 -.->|"«extend»"| UC3B
    UC5 -.->|"«include»"| UC5A
    UC4 -.->|"«extend»"| UC3
```

## Ghi chú

- **Khóa tạm thời** (UC3A): admin chọn thời hạn (ví dụ: 7 ngày, 30 ngày) — hệ thống tự động mở khóa khi hết hạn.
- **Khóa vĩnh viễn** (UC3B): extend của UC3 — yêu cầu xác nhận thêm và lý do ghi vào `AdminLog`.
- **Mở khóa** (UC4): chỉ áp dụng khi tài khoản đang bị khóa tạm thời hoặc vĩnh viễn; extend quan hệ với UC3.
- Mọi hành động khóa/mở khóa đều được ghi vào `admin_logs` kèm lý do.
