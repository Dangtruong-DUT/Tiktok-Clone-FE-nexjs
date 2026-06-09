# UC-06: Tương tác với bài đăng

Mô tả các ca sử dụng liên quan đến tương tác xã hội: thích, bình luận (bao gồm lồng nhau), chia sẻ, repost, quote post và @mention. Sau khi người dùng bình luận, hệ thống tự động enqueue vào pipeline kiểm duyệt AI qua Kafka.

> Hình 3.6 — Sơ đồ ca sử dụng — Tương tác với bài đăng

```mermaid
flowchart LR
    classDef actor fill:#dae8fc,stroke:#6c8ebf,stroke-width:2px,color:#000,font-weight:bold
    classDef uc     fill:#fff2cc,stroke:#d6b656,stroke-width:1.5px,color:#000
    classDef sub    fill:#f9f0ff,stroke:#9673a6,stroke-width:1.5px,color:#000
    classDef sys    fill:#f8cecc,stroke:#b85450,stroke-width:1.5px,color:#000

    U(["👤 Người dùng\nđã xác thực"]):::actor

    subgraph SYS["Hệ thống — Tương tác với bài đăng"]
        direction TB

        subgraph GRP_LIKE["Thích"]
            direction TB
            UC1("Thích bài đăng"):::uc
            UC2("Bỏ thích bài đăng"):::uc
        end

        subgraph GRP_COMMENT["Bình luận"]
            direction TB
            UC3("Bình luận\nbài đăng"):::uc
            UC3A("Bình luận\nlồng nhau"):::sub
            UC3B("Enqueue vào pipeline\nkiểm duyệt AI"):::sys
            UC4("Đề cập\n@mention người dùng"):::uc
        end

        subgraph GRP_SHARE["Chia sẻ & Đăng lại"]
            direction TB
            UC5("Chia sẻ bài đăng"):::uc
            UC6("Repost"):::uc
            UC7("Quote post"):::uc
        end
    end

    U --> UC1 & UC2
    U --> UC3 & UC4
    U --> UC5 & UC6 & UC7

    UC3A -.->|"«extend»"| UC3
    UC4  -.->|"«extend»"| UC3
    UC3  -.->|"«include»"| UC3B
```

## Ghi chú

- **Pipeline kiểm duyệt AI** (UC3B): sau khi bình luận được lưu thành công, Laravel queue worker tự động gửi message vào Kafka topic `moderation.request.v1` — không đồng bộ, không chặn response trả về client.
- **Bình luận lồng nhau** (UC3A): người dùng reply vào một bình luận; mỗi reply cũng bị enqueue kiểm duyệt độc lập.
- **@mention** (UC4): hoạt động trong cả bình luận và nội dung bài đăng; người được mention nhận thông báo.
- **Quote post** (UC7): tạo bài đăng mới embed bài gốc kèm bình luận của người đăng lại.
