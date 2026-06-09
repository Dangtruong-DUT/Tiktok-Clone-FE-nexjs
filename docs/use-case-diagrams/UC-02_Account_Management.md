# UC-02: Quản lý tài khoản cá nhân

Mô tả chi tiết các ca sử dụng liên quan đến xác thực và quản lý hồ sơ người dùng, bao gồm đăng ký (kèm xác thực email), đăng nhập, đăng xuất, cập nhật thông tin cá nhân và cài đặt quyền riêng tư.

> Hình 3.2 — Sơ đồ ca sử dụng — Quản lý tài khoản cá nhân

```mermaid
flowchart LR
    classDef actor fill:#dae8fc,stroke:#6c8ebf,stroke-width:2px,color:#000,font-weight:bold
    classDef uc     fill:#fff2cc,stroke:#d6b656,stroke-width:1.5px,color:#000
    classDef sub    fill:#f9f0ff,stroke:#9673a6,stroke-width:1.5px,color:#000

    G(["👤 Khách"]):::actor
    U(["👤 Người dùng\nđã xác thực"]):::actor

    subgraph SYS["Hệ thống — Quản lý tài khoản cá nhân"]
        direction TB

        UC1("Đăng ký tài khoản"):::uc
        UC1A("Xác thực email"):::sub

        UC2("Đăng nhập"):::uc
        UC3("Đăng xuất"):::uc

        subgraph GRP_PROFILE["Cập nhật thông tin cá nhân"]
            direction LR
            UC4("Cập nhật thông tin\ncá nhân"):::uc
            UC4A("Thay đổi ảnh đại diện"):::sub
            UC4B("Cập nhật tên\nhiển thị"):::sub
            UC4C("Cập nhật bio"):::sub
        end

        subgraph GRP_PRIVACY["Cài đặt quyền riêng tư"]
            direction LR
            UC5("Cài đặt quyền\nriêng tư"):::uc
            UC5A("Ẩn / hiện\ndanh sách follower"):::sub
            UC5B("Ẩn / hiện\nvideo đã thích"):::sub
            UC5C("Ẩn / hiện\nvideo đã đánh dấu"):::sub
        end
    end

    G --> UC1 & UC2
    U --> UC2 & UC3 & UC4 & UC5

    UC1  -.->|"«include»"| UC1A
    UC4  -.->|"«include»"| UC4A
    UC4  -.->|"«include»"| UC4B
    UC4  -.->|"«include»"| UC4C
    UC5  -.->|"«include»"| UC5A
    UC5  -.->|"«include»"| UC5B
    UC5  -.->|"«include»"| UC5C
```

## Ghi chú

- **Đăng ký**: sau khi điền form, hệ thống gửi email xác thực — tài khoản chỉ được kích hoạt sau khi người dùng click link trong email.
- **Cài đặt quyền riêng tư**: mỗi tùy chọn có thể bật/tắt độc lập; thay đổi có hiệu lực ngay lập tức.
- Khách chỉ có thể đăng ký và đăng nhập; tất cả chức năng còn lại yêu cầu xác thực.
