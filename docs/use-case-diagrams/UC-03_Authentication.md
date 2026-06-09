# UC-03: Xác thực người dùng

Mô tả chi tiết luồng đăng nhập qua hai phương thức: email/mật khẩu kết hợp JWT access token + refresh token qua BFF proxy, và Google OAuth. Bao gồm ca sử dụng đổi mật khẩu và quên mật khẩu với luồng email đặt lại.

> Hình 3.3 — Sơ đồ ca sử dụng — Xác thực người dùng

```mermaid
flowchart LR
    classDef actor fill:#dae8fc,stroke:#6c8ebf,stroke-width:2px,color:#000,font-weight:bold
    classDef uc     fill:#fff2cc,stroke:#d6b656,stroke-width:1.5px,color:#000
    classDef sub    fill:#f9f0ff,stroke:#9673a6,stroke-width:1.5px,color:#000
    classDef ext    fill:#d5e8d4,stroke:#82b366,stroke-width:2px,color:#000,font-weight:bold

    U(["👤 Người dùng"]):::actor

    subgraph SYS["Hệ thống — Xác thực người dùng"]
        direction TB

        subgraph GRP_LOGIN["Đăng nhập"]
            direction TB
            UC1("Đăng nhập\nemail / mật khẩu"):::uc
            UC1A("Cấp JWT\naccess token"):::sub
            UC1B("Làm mới access token\nqua BFF proxy"):::sub
            UC2("Đăng nhập\nGoogle OAuth"):::uc
        end

        subgraph GRP_PWD["Quản lý mật khẩu"]
            direction TB
            UC3("Đổi mật khẩu"):::uc
            UC3A("Xác thực\nmật khẩu hiện tại"):::sub
            UC4("Quên mật khẩu"):::uc
            UC4A("Gửi email\nđặt lại mật khẩu"):::sub
            UC4B("Đặt lại mật khẩu\nqua token"):::sub
        end
    end

    GOOGLE(["⚙️ Google\nOAuth 2.0"]):::ext
    EMAIL(["⚙️ Dịch vụ\nEmail"]):::ext

    U --> UC1 & UC2 & UC3 & UC4

    UC1  -.->|"«include»"| UC1A
    UC1A -.->|"«include»"| UC1B
    UC3  -.->|"«include»"| UC3A
    UC4  -.->|"«include»"| UC4A
    UC4A -.->|"«include»"| UC4B

    UC2  --> GOOGLE
    UC4A --> EMAIL
```

## Ghi chú

- **BFF Proxy**: Next.js App Router đóng vai trò BFF (Backend for Frontend) — refresh token được lưu trong httpOnly cookie, không lộ ra client-side JavaScript.
- **Google OAuth**: luồng redirect qua NextAuth — backend nhận `id_token` từ Google, tạo hoặc map tài khoản nội bộ.
- **Đặt lại mật khẩu**: token trong email có thời hạn ngắn (1 giờ); hết hạn → người dùng phải yêu cầu lại.
