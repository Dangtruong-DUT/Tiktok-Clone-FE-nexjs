import { BRAND_CONFIG } from "@/config/brand.config";
import React from "react";

export default function PrivacyPolicyPage() {
    return (
        <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300 mx-auto">
            <section
                className="relative py-24 px-4 md:px-6 lg:px-8 bg-center bg-cover"
                style={{ backgroundImage: "url('/images/Knowledge for you.png')" }}
            >
                <div className="absolute inset-0 bg-black/50 dark:bg-black/70"></div>
                <div className="relative max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl tracking-tight drop-shadow-lg animate-fade-in">
                        Chính sách Quyền riêng tư
                    </h1>
                    <div className="mt-4">
                        <p className="text-sm text-white font-medium drop-shadow">
                            Cập nhật lần cuối: Ngày 1 tháng 9 năm 2025
                        </p>
                    </div>
                </div>
            </section>

            <section className="py-16 md:py-24 lg:py-32 px-4 md:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto space-y-12">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-l-4 border-brand pl-4">
                            1. Giới thiệu
                        </h2>
                        <p className="mt-4 text-gray-700 dark:text-gray-300 leading-7">
                            Chào mừng bạn đến với {BRAND_CONFIG.APP_NAME}. Chính sách Quyền riêng tư này giải thích cách{" "}
                            {BRAND_CONFIG.COMPANY_NAME} (&quot;chúng tôi&quot;) thu thập, sử dụng, và chia sẻ thông tin
                            về bạn khi bạn sử dụng trang web, ứng dụng di động và các dịch vụ khác của chúng tôi (gọi
                            chung là &quot;Dịch vụ&quot;). Chúng tôi cam kết bảo vệ quyền riêng tư của bạn.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-l-4 border-brand pl-4">
                            2. Thông tin chúng tôi thu thập
                        </h2>
                        <p className="mt-4 text-gray-700 dark:text-gray-300 leading-7">
                            Chúng tôi thu thập thông tin theo nhiều cách khác nhau để cung cấp và cải thiện Dịch vụ.
                        </p>
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mt-6 pl-4">
                            a. Thông tin bạn cung cấp cho chúng tôi
                        </h3>
                        <ul className="mt-4 space-y-2 text-gray-700 dark:text-gray-300 leading-7 list-disc list-inside">
                            <li>
                                <strong>Thông tin tài khoản:</strong> Khi bạn tạo tài khoản, bạn cung cấp cho chúng tôi
                                tên người dùng, mật khẩu, địa chỉ email, và ngày sinh.
                            </li>
                            <li>
                                <strong>Nội dung người dùng:</strong> Chúng tôi thu thập nội dung bạn tạo ra trên Dịch
                                vụ, bao gồm video, hình ảnh, bình luận, tin nhắn trực tiếp, và siêu dữ liệu liên quan
                                (thời gian, địa điểm tạo).
                            </li>
                            <li>
                                <strong>Thông tin liên lạc:</strong> Nếu bạn liên hệ với chúng tôi, chúng tôi sẽ thu
                                thập thông tin bạn cung cấp trong quá trình đó.
                            </li>
                        </ul>

                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mt-6 pl-4">
                            b. Thông tin từ các bên thứ ba
                        </h3>
                        <p className="mt-4 text-gray-700 dark:text-gray-300 leading-7">
                            Nếu bạn chọn đăng ký hoặc đăng nhập bằng tài khoản của bên thứ ba (như Google), chúng tôi sẽ
                            nhận được một số thông tin từ nhà cung cấp đó, chẳng hạn như tên, địa chỉ email, ảnh đại
                            diện và ID tài khoản của bạn, tuân theo cài đặt quyền riêng tư của bạn trên dịch vụ đó.
                        </p>

                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mt-6 pl-4">
                            c. Thông tin chúng tôi thu thập tự động
                        </h3>
                        <ul className="mt-4 space-y-2 text-gray-700 dark:text-gray-300 leading-7 list-disc list-inside">
                            <li>
                                <strong>Dữ liệu sử dụng:</strong> Chúng tôi thu thập thông tin về cách bạn tương tác với
                                Dịch vụ, chẳng hạn như video bạn xem, nội dung bạn thích, người dùng bạn theo dõi, và
                                các tìm kiếm bạn thực hiện.
                            </li>
                            <li>
                                <strong>Thông tin thiết bị và kỹ thuật:</strong> Chúng tôi thu thập địa chỉ IP, loại
                                thiết bị, hệ điều hành, mã nhận dạng thiết bị duy nhất, loại trình duyệt, và cài đặt
                                ngôn ngữ.
                            </li>
                            <li>
                                <strong>Dữ liệu vị trí:</strong> Chúng tôi có thể thu thập thông tin về vị trí gần đúng
                                của bạn từ địa chỉ IP hoặc thông tin vị trí chính xác hơn từ GPS của thiết bị nếu bạn
                                cho phép.
                            </li>
                            <li>
                                <strong>Cookies và công nghệ tương tự:</strong> Chúng tôi sử dụng cookies để vận hành và
                                cung cấp Dịch vụ, ghi nhớ tùy chọn của bạn, và phân tích hiệu suất.
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-l-4 border-brand pl-4">
                            3. Cách chúng tôi sử dụng thông tin của bạn
                        </h2>
                        <p className="mt-4 text-gray-700 dark:text-gray-300 leading-7">
                            Chúng tôi sử dụng thông tin thu thập được cho các mục đích sau:
                        </p>
                        <ul className="mt-4 space-y-2 text-gray-700 dark:text-gray-300 leading-7 list-disc list-inside">
                            <li>Cung cấp, duy trì và cải thiện Dịch vụ của chúng tôi.</li>
                            <li>
                                <strong>Cá nhân hóa trải nghiệm của bạn,</strong> chẳng hạn như đề xuất video và nội
                                dung mà chúng tôi nghĩ bạn sẽ thích (ví dụ: trên trang &quot;Dành cho bạn&quot;).
                            </li>
                            <li>Cho phép bạn tương tác với những người dùng khác.</li>
                            <li>
                                Giao tiếp với bạn, bao gồm gửi thông báo về dịch vụ và các thông tin tiếp thị (bạn có
                                thể từ chối).
                            </li>
                            <li>
                                Đảm bảo an toàn và bảo mật cho nền tảng, phát hiện và ngăn chặn gian lận, spam và lạm
                                dụng.
                            </li>
                            <li>Thực hiện phân tích để hiểu cách người dùng sử dụng Dịch vụ và cải thiện sản phẩm.</li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-l-4 border-brand pl-4">
                            4. Cách chúng tôi chia sẻ thông tin
                        </h2>
                        <p className="mt-4 text-gray-700 dark:text-gray-300 leading-7">
                            Chúng tôi không bán thông tin cá nhân của bạn. Chúng tôi có thể chia sẻ thông tin trong các
                            trường hợp sau:
                        </p>
                        <ul className="mt-4 space-y-2 text-gray-700 dark:text-gray-300 leading-7 list-disc list-inside">
                            <li>
                                <strong>Với những người dùng khác:</strong> Thông tin hồ sơ và nội dung bạn đăng tải
                                công khai sẽ được hiển thị cho những người dùng khác.
                            </li>
                            <li>
                                <strong>Với các nhà cung cấp dịch vụ:</strong> Chúng tôi chia sẻ thông tin với các đối
                                tác giúp chúng tôi vận hành Dịch vụ, chẳng hạn như nhà cung cấp dịch vụ lưu trữ đám mây,
                                phân tích dữ liệu và dịch vụ khách hàng.
                            </li>
                            <li>
                                <strong>Vì lý do pháp lý:</strong> Chúng tôi có thể tiết lộ thông tin của bạn nếu được
                                yêu cầu bởi pháp luật hoặc để bảo vệ quyền, tài sản, và sự an toàn của{" "}
                                {BRAND_CONFIG.COMPANY_NAME}, người dùng của chúng tôi, hoặc công chúng.
                            </li>
                            <li>
                                <strong>Trong trường hợp chuyển giao kinh doanh:</strong> Nếu chúng tôi tham gia vào một
                                vụ sáp nhập, mua lại hoặc bán tài sản, thông tin của bạn có thể được chuyển giao.
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-l-4 border-brand pl-4">
                            5. Lưu trữ và Xóa dữ liệu
                        </h2>
                        <p className="mt-4 text-gray-700 dark:text-gray-300 leading-7">
                            Chúng tôi lưu trữ thông tin của bạn miễn là tài khoản của bạn còn hoạt động hoặc khi cần
                            thiết để cung cấp Dịch vụ cho bạn. Bạn có thể xóa tài khoản của mình bất cứ lúc nào thông
                            qua cài đặt ứng dụng. Sau khi bạn xóa tài khoản, chúng tôi sẽ thực hiện các bước để xóa
                            thông tin của bạn, tuy nhiên, một số thông tin có thể được lưu giữ trong các bản sao lưu
                            hoặc vì lý do pháp lý.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-l-4 border-brand pl-4">
                            6. Quyền và Lựa chọn của bạn
                        </h2>
                        <p className="mt-4 text-gray-700 dark:text-gray-300 leading-7">
                            Bạn có các quyền sau đối với thông tin cá nhân của mình:
                        </p>
                        <ul className="mt-4 space-y-2 text-gray-700 dark:text-gray-300 leading-7 list-disc list-inside">
                            <li>
                                <strong>Truy cập và Chỉnh sửa:</strong> Bạn có thể xem và chỉnh sửa thông tin hồ sơ của
                                mình thông qua cài đặt tài khoản.
                            </li>
                            <li>
                                <strong>Xóa:</strong> Bạn có quyền yêu cầu xóa tài khoản và dữ liệu cá nhân của mình.
                            </li>
                            <li>
                                <strong>Quản lý thông báo:</strong> Bạn có thể quản lý các thông báo đẩy và email trong
                                phần cài đặt.
                            </li>
                            <li>
                                <strong>Kiểm soát Cookie:</strong> Hầu hết các trình duyệt web cho phép bạn kiểm soát
                                cookies thông qua cài đặt.
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-l-4 border-brand pl-4">
                            7. Quyền riêng tư của trẻ em
                        </h2>
                        <p className="mt-4 text-gray-700 dark:text-gray-300 leading-7">
                            Dịch vụ của chúng tôi không dành cho trẻ em dưới 13 tuổi (hoặc độ tuổi tối thiểu theo luật
                            định tại khu vực của bạn). Chúng tôi không cố ý thu thập thông tin cá nhân từ trẻ em. Nếu
                            bạn phát hiện ra rằng một đứa trẻ đã cung cấp cho chúng tôi thông tin cá nhân mà không có sự
                            đồng ý của cha mẹ, vui lòng liên hệ với chúng tôi để chúng tôi có thể xóa thông tin đó.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-l-4 border-brand pl-4">
                            8. Thay đổi đối với Chính sách này
                        </h2>
                        <p className="mt-4 text-gray-700 dark:text-gray-300 leading-7">
                            Chúng tôi có thể cập nhật Chính sách Quyền riêng tư này theo thời gian. Khi chúng tôi thực
                            hiện các thay đổi quan trọng, chúng tôi sẽ thông báo cho bạn bằng cách cập nhật ngày
                            &quot;Cập nhật lần cuối&quot; ở đầu trang này và/hoặc thông báo trong ứng dụng.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-l-4 border-brand pl-4">
                            9. Liên hệ với chúng tôi
                        </h2>
                        <p className="mt-4 text-gray-700 dark:text-gray-300 leading-7">
                            Nếu bạn có bất kỳ câu hỏi hoặc thắc mắc nào về Chính sách Quyền riêng tư này, vui lòng liên
                            hệ với chúng tôi tại{" "}
                            <a
                                href={`mailto:${BRAND_CONFIG.CONTACT_EMAIL}`}
                                className="text-brand hover:underline font-medium transition-colors duration-200"
                            >
                                {BRAND_CONFIG.CONTACT_EMAIL}
                            </a>
                            .
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
