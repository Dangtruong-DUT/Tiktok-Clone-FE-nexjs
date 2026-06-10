# UC-01: Sơ đồ ca sử dụng tổng quan

Thể hiện toàn bộ các nhóm chức năng của hệ thống Snapi và mối quan hệ giữa ba tác nhân chính. Các ca sử dụng được nhóm thành bốn gói chức năng lớn: Xác thực và tài khoản, Nội dung và tương tác, AI và kiểm duyệt, và Quản trị hệ thống.

> Hình 3.1 — Sơ đồ ca sử dụng tổng quan

```mermaid
flowchart LR
    classDef actor    fill:#dae8fc,stroke:#6c8ebf,stroke-width:2px,color:#000,font-weight:bold
    classDef adminAct fill:#ffe6cc,stroke:#d79b00,stroke-width:2px,color:#000,font-weight:bold
    classDef uc       fill:#fff2cc,stroke:#d6b656,stroke-width:1.5px,color:#000

    G(["👤 Khách"]):::actor
    U(["👤 Người dùng\nđã xác thực"]):::actor
    A(["👤 Quản trị viên"]):::adminAct

    subgraph PKG1["Xác thực & Tài khoản"]
        direction TB
        UC1("Đăng ký tài khoản"):::uc
        UC2("Đăng nhập"):::uc
        UC3("Đăng xuất"):::uc
        UC4("Cập nhật hồ sơ"):::uc
        UC5("Cài đặt quyền riêng tư"):::uc
    end

    subgraph PKG2["Nội dung & Tương tác"]
        direction TB
        UC6("Xem feed / Khám phá"):::uc
        UC7("Tìm kiếm"):::uc
        UC8("Tạo & đăng video"):::uc
        UC9("Tương tác bài đăng"):::uc
        UC10("Nhận thông báo"):::uc
        UC11("Cá nhân hóa"):::uc
    end

    subgraph PKG3["AI & Kiểm duyệt"]
        direction TB
        UC12("AI Copilot"):::uc
        UC13("Kiểm duyệt tự động"):::uc
        UC14("Gửi kháng cáo"):::uc
    end

    subgraph PKG4["Quản trị hệ thống"]
        direction TB
        UC15("Quản lý người dùng"):::uc
        UC16("Xử lý kiểm duyệt\n& kháng cáo"):::uc
        UC17("Báo cáo & Thống kê"):::uc
    end

    G --> UC1 & UC2 & UC6 & UC7

    U --> UC2 & UC3 & UC4 & UC5
    U --> UC6 & UC7 & UC8 & UC9 & UC10 & UC11
    U --> UC12 & UC14

    A --> UC13 & UC15 & UC16 & UC17
```

## Tác nhân

| Tác nhân | Mô tả |
|----------|-------|
| Khách (Guest) | Người dùng chưa đăng nhập — có thể duyệt và tìm kiếm nhưng không tương tác |
| Người dùng đã xác thực | Đã đăng nhập — đầy đủ quyền tương tác, tạo nội dung và sử dụng AI |
| Quản trị viên | Nhân viên quản lý — kiểm duyệt nội dung, quản lý tài khoản và xem thống kê |

## Ghi chú

- Người dùng đã xác thực kế thừa toàn bộ quyền của Khách.
- Kiểm duyệt tự động (UC13) được kích hoạt bởi hệ thống sau mỗi lần người dùng đăng bình luận hoặc bài đăng, không phải hành động trực tiếp của Admin.
