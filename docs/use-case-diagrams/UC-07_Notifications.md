# UC-07: Nhận thông báo

Mô tả hệ thống thông báo: nhận thông báo tương tác, kiểm duyệt, kết quả kháng cáo và đánh dấu đã đọc. Thông báo được phân nhóm theo nguồn kích hoạt.

> Hình 3.7 — Sơ đồ ca sử dụng — Nhận thông báo

```mermaid
flowchart LR
    classDef actor fill:#dae8fc,stroke:#6c8ebf,stroke-width:2px,color:#000,font-weight:bold
    classDef uc     fill:#fff2cc,stroke:#d6b656,stroke-width:1.5px,color:#000
    classDef sub    fill:#f9f0ff,stroke:#9673a6,stroke-width:1.5px,color:#000
    classDef trigger fill:#f8cecc,stroke:#b85450,stroke-width:1.5px,color:#000

    U(["👤 Người dùng\nđã xác thực"]):::actor

    subgraph SYS["Hệ thống — Nhận thông báo"]
        direction TB

        subgraph GRP_INTERACT["Thông báo tương tác"]
            direction TB
            UC1("Nhận TB:\nbài đăng được thích"):::uc
            UC2("Nhận TB:\ncó bình luận mới"):::uc
            UC3("Nhận TB:\nđược @mention"):::uc
            UC4("Nhận TB:\ncó người theo dõi mới"):::uc
        end

        subgraph GRP_MOD["Thông báo kiểm duyệt"]
            direction TB
            UC5("Nhận TB:\nnội dung bị ẩn bởi AI"):::uc
            UC6("Nhận TB:\nthông báo từ Admin"):::uc
        end

        subgraph GRP_APPEAL["Thông báo kháng cáo"]
            direction TB
            UC7("Nhận TB:\nkháng cáo được chấp thuận"):::uc
            UC8("Nhận TB:\nkháng cáo bị từ chối"):::uc
        end

        subgraph GRP_MANAGE["Quản lý thông báo"]
            direction TB
            UC9("Xem danh sách\nthông báo"):::uc
            UC10("Đánh dấu\nthông báo đã đọc"):::uc
            UC10A("Đánh dấu tất cả\nđã đọc"):::sub
        end
    end

    U --> UC1 & UC2 & UC3 & UC4
    U --> UC5 & UC6
    U --> UC7 & UC8
    U --> UC9 & UC10

    UC10 -.->|"«extend»"| UC10A
    UC9  -.->|"«include»"| UC10
```

## Ghi chú

- Thông báo tương tác được tạo bởi **Laravel Events** khi có hành động xã hội xảy ra (like, comment, follow, mention).
- Thông báo kiểm duyệt được tạo khi AI worker ghi kết quả `violation = true` vào `AiModerationReport`, hoặc khi Admin thực hiện hành động thủ công.
- Thông báo kháng cáo được tạo khi Admin cập nhật trạng thái `appeal`.
