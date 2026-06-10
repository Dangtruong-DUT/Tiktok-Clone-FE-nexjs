# UC-04: Khám phá và xem bài đăng

Mô tả các ca sử dụng liên quan đến xem và tìm kiếm nội dung. Cả Khách và Người dùng đã xác thực đều có thể thực hiện, nhưng Khách không thể tương tác (thích, bình luận, theo dõi).

> Hình 3.4 — Sơ đồ ca sử dụng — Khám phá và xem bài đăng

```mermaid
flowchart LR
    classDef actor fill:#dae8fc,stroke:#6c8ebf,stroke-width:2px,color:#000,font-weight:bold
    classDef uc     fill:#fff2cc,stroke:#d6b656,stroke-width:1.5px,color:#000
    classDef sub    fill:#f9f0ff,stroke:#9673a6,stroke-width:1.5px,color:#000
    classDef ucOnly fill:#e1d5e7,stroke:#9673a6,stroke-width:1.5px,color:#000

    G(["👤 Khách"]):::actor
    U(["👤 Người dùng\nđã xác thực"]):::actor

    subgraph SYS["Hệ thống — Khám phá và xem bài đăng"]
        direction TB

        subgraph GRP_FEED["Xem luồng nội dung"]
            direction TB
            UC1("Xem luồng\nFor You"):::uc
            UC1A("Cuộn vô hạn\ncá nhân hóa"):::sub
            UC2("Xem luồng\nFollowing"):::ucOnly
        end

        subgraph GRP_DISCOVER["Khám phá"]
            direction TB
            UC3("Khám phá\ntheo hashtag"):::uc
            UC4("Tìm kiếm\ntài khoản và video"):::uc
        end

        subgraph GRP_PROFILE["Xem hồ sơ"]
            direction TB
            UC5("Xem trang hồ sơ\nngười dùng khác"):::uc
            UC5A("Xem danh sách\nvideo đã đăng"):::sub
            UC5B("Xem số liệu\nfollower / following"):::sub
        end
    end

    G --> UC1 & UC3 & UC4 & UC5
    U --> UC1 & UC2 & UC3 & UC4 & UC5

    UC1 -.->|"«include»"| UC1A
    UC5 -.->|"«include»"| UC5A
    UC5 -.->|"«include»"| UC5B
```

## Ghi chú

- **For You** (UC1): Feed cá nhân hóa — khách xem được nhưng feed chưa được cá nhân hóa theo lịch sử xem.
- **Following** (UC2): Chỉ hiển thị khi đã đăng nhập và đang theo dõi ít nhất một người dùng.
- Khách xem được toàn bộ nội dung công khai nhưng **không thể** thích, bình luận, theo dõi hay đánh dấu.
