# Sách Đặc Tả Chi Tiết Mọi Tính Năng (Dành Cho Người Dùng)

Cuốn sách này cung cấp một cái nhìn toàn cảnh và chi tiết nhất về **toàn bộ tính năng đang hoạt động** trên nền tảng của chúng tôi. Chúng tôi minh bạch toàn bộ các thông số để Quý khách có thể khai thác tối đa sức mạnh của ứng dụng.

---

## 1. Hệ thống Đăng ký & Bảo mật Tài khoản

### 1.1. Các quy định khắt khe khi điền thông tin Đăng ký
Để bảo vệ cộng đồng, hệ thống thực hiện kiểm tra tự động đối với 6 hạng mục sau:
* **Họ và Tên:** Bắt buộc nhập. Khuyến khích dùng tên thật.
* **Tên người dùng (Username):** Bắt buộc nhập. Không được dùng dấu cách hay chữ có dấu. Hệ thống sẽ đảm bảo cái tên này là "Độc nhất vô nhị".
* **Email:** Bắt buộc nhập Email thật để nhận mã xác thực.
* **Mật khẩu bảo vệ:** Bắt buộc phải đủ mạnh, tối thiểu 8 ký tự.
* **Xác nhận mật khẩu:** Phải khớp 100% với mật khẩu đã nhập.
* **Ngày tháng năm sinh:** Ứng dụng từ chối những người dùng không đủ độ tuổi.

### 1.2. Hồ sơ cá nhân (Profile)
Sau khi tạo tài khoản, Quý khách có thể tự do trang trí Trang cá nhân của mình bằng cách bổ sung:
* **Tiểu sử (Bio):** Giới thiệu ngắn về bản thân.
* **Vị trí (Location):** Nơi Quý khách đang sinh sống.
* **Trang web (Website):** Gắn đường dẫn dẫn đến cửa hàng hoặc mạng xã hội khác của Quý khách.

### 1.3. Cỗ máy bảo vệ (Chống tấn công bẻ khóa)
* **Luật 5 phút:** Nếu có ai đó cố tình dò mật khẩu của Quý khách và gõ sai **quá 5 lần trong vòng 1 phút**, hệ thống lập tức sập cửa và đóng băng thiết bị đó tạm thời.
* **Xác thực Email:** Nếu không xác thực Email, Quý khách chỉ có thể xem video chứ không được phép tải video lên.
* **Đăng xuất đồng loạt:** Tính năng an toàn cho phép Quý khách đăng xuất tài khoản khỏi mọi thiết bị khác cùng một lúc nếu phát hiện nghi ngờ.

---

## 2. Hệ thống Tìm kiếm & Khám phá

### 2.1. Cỗ máy tìm kiếm toàn diện
Quý khách có thể sử dụng thanh tìm kiếm để tra cứu 3 loại dữ liệu:
* **Tìm kiếm Người dùng:** Nhập tên hoặc Username để tìm bạn bè.
* **Tìm kiếm Bài viết:** Nhập các từ khóa để tìm các video liên quan.
* **Tìm kiếm Hashtag:** Nhập thẻ `#` (Ví dụ: `#dulich`) để xem tất cả các video đang thịnh hành thuộc chủ đề đó.

### 2.2. Gợi ý thông minh
* **Gợi ý Kết bạn (Suggested Users):** Ứng dụng tự động phân tích sở thích để đề xuất những người Quý khách có thể quen biết.
* **Video liên quan (Related Posts):** Khi đang xem một video hay, vuốt lên, ứng dụng sẽ đề xuất các video có chủ đề tương tự để Quý khách xem tiếp.

---

## 3. Hệ thống Tương tác & Mạng xã hội

### 3.1. Các cấp độ quan hệ
* **Đang theo dõi (Following):** Quý khách ấn nút Theo dõi một người khác. Quý khách sẽ thấy bài viết của họ.
* **Người theo dõi (Followers):** Những người ấn nút Theo dõi Quý khách.
* **Bạn bè (Friends):** Khi Quý khách và một người khác **cùng bấm theo dõi lẫn nhau**, hệ thống sẽ nâng cấp quan hệ thành "Bạn bè". Lúc này hai người có quyền xem các video riêng tư của nhau.

### 3.2. Quản lý tương tác cá nhân
Trang cá nhân của Quý khách được chia thành các Tab rõ ràng:
* **Tab Bài đăng:** Nơi chứa các video Quý khách tự quay.
* **Tab Đã Thích (Liked Posts):** Nơi cất giữ những video Quý khách đã thả tim.
* **Tab Lưu trữ (Bookmarked Posts):** Nơi cất giữ những video Quý khách đánh dấu "Lưu lại xem sau". 
* *Đặc biệt: Tính năng Bình luận lồng nhau (Nested Comments)* cho phép Quý khách trả lời trực tiếp một bình luận của người khác, tạo thành một đoạn hội thoại ngay dưới video.

### 3.3. Hệ thống Thông báo (Notifications)
* Bất cứ khi nào có ai thả tim, bình luận, hoặc theo dõi, hệ thống sẽ đẩy một chấm đỏ thông báo.
* Quý khách có thể xem **Tổng số thông báo chưa đọc** và nhấn nút **"Đánh dấu đã đọc tất cả"** để làm sạch danh sách một cách nhanh chóng.

---

## 4. Hệ thống Sản xuất & Trợ lý AI (SnapiStudio)

### 4.1. Giới hạn Tiêu chuẩn về Video và Hình ảnh
Mỗi khi Quý khách nhấn nút **[Đăng Video]**, xin lưu ý các giới hạn phần cứng sau:
* **Định dạng Video:** Máy chủ chỉ chấp nhận **MP4, MOV, và WebM**.
* **Dung lượng Video:** Tối đa **500 MB**. 
* **Chất lượng Video:** Tự động tạo ra 5 mức: **360p, 480p, 720p (HD), 1080p (Full HD), và 1440p (2K)**. 
* **Số lượng tệp:** Tối đa **10 tệp tin** tạo thành Album ngang.
* **Độ dài câu chữ (Caption):** Tối đa **4000 ký tự**.
* **Số bạn bè được nhắc tên:** Gọi tên tối đa **50 người** bằng dấu `@`.
* **Quyền riêng tư:** Bao gồm 3 rào chắn: Mọi người, Chỉ Bạn Bè, Chỉ mình tôi.
* **Đăng theo Lịch (Scheduled Posts):** Quý khách có thể soạn video vào ban đêm, sau đó dùng tính năng hẹn giờ để ứng dụng tự động đăng lên mạng vào lúc 8h sáng hôm sau.

### 4.2. Trợ lý Kịch bản Thông minh (AI Copilot)
* AI của chúng tôi có khả năng "Nhìn". Bấm nút **[Ghim đính kèm]**, cắt ra một khung hình (Frames) hoặc một mẩu video nhỏ (Clips) và đưa cho AI xem.
* Trợ lý AI trả lời theo thời gian thực (Streaming) giống như đang gõ máy tính.
* **Luật xác nhận:** Bắt buộc Quý khách phải bấm nút **[Chấp nhận]** thì những ý tưởng của AI mới được dán vào bài viết.

---

## 5. Hệ thống Chăm sóc Sức khỏe Số (Digital Wellness)

### 5.1. Phân tích Ngôn ngữ tự nhiên
Quý khách chỉ cần viết một câu nói vào ô trống: *"Khóa máy sau 120 phút vào cuối tuần"*.
Hệ thống AI tự động hiểu: "120 phút" và "Cuối tuần", thiết lập bộ đếm giờ ngầm.

### 5.2. Cỗ máy đếm giờ (Heartbeat) & Thống kê
Cứ mỗi phút Quý khách xem video, điện thoại sẽ gửi một tín hiệu (Heartbeat) để cộng dồn. Chạm mốc, ứng dụng sập màn hình nhắc nhở nghỉ ngơi. 
Đồng thời, Quý khách có thể xem **Lịch sử & Biểu đồ thống kê** (Stats & History) để biết tuần qua mình đã dùng ứng dụng bao nhiêu tiếng, và yêu cầu AI gửi lời khuyên bảo vệ mắt.

---

## 6. Hệ thống Pháp chế & Kháng nghị (Appeals)

### 6.1. Lối đi riêng cho người bị khóa (Bypass)
Tài khoản bị cấm (Banned) sẽ bị chặn mọi chức năng. Tuy nhiên, hệ thống luôn mở một ngoại lệ duy nhất: Cánh cửa dẫn đến phòng **Khiếu nại (Appeals)**.

### 6.2. Bằng chứng rõ ràng (Kho lưu trữ Xóa mềm)
Video bị xóa thực chất chỉ bị "Xóa mềm" (Giấu đi). Khi bước vào phòng Khiếu nại, hệ thống sẽ mở khóa kho lưu trữ này và chiếu lại (Xem trước) để Quý khách có bằng chứng viết đơn kêu oan. Nếu Quản trị viên (Admin) duyệt, video sẽ trở lại bình thường.
