import { BRAND_CONFIG } from "@/config/brand.config";
import React from "react";

export default function TermsOfServicePage() {
    return (
        <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300 mx-auto">
            <section
                className="relative py-24 px-4 md:px-6 lg:px-8 bg-center bg-cover"
                style={{ backgroundImage: "url('/images/desktop-wallpaper-tiktok.jpg')" }}
            >
                <div className="absolute inset-0 bg-black/50 dark:bg-black/70"></div>
                <div className="relative max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl tracking-tight drop-shadow-lg animate-fade-in">
                        Điều khoản Dịch vụ
                    </h1>
                    <p className="text-sm text-white font-medium drop-shadow mt-4">
                        Cập nhật lần cuối: Ngày 1 tháng 9 năm 2025
                    </p>
                </div>
            </section>

            <section className="py-16 md:py-24 lg:py-32 px-4 md:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto space-y-12">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-l-4 border-brand pl-4">
                            1. Chấp nhận Điều khoản
                        </h2>
                        <p className="mt-4 text-gray-700 dark:text-gray-300 leading-7">
                            Chào mừng bạn đến với {BRAND_CONFIG.APP_NAME}! Các Điều khoản Dịch vụ này (&quot;Điều
                            khoản&quot;) điều chỉnh việc bạn truy cập và sử dụng nền tảng của chúng tôi, bao gồm trang
                            web, ứng dụng di động và các dịch vụ khác (gọi chung là &quot;Dịch vụ&quot;) được cung cấp
                            bởi {BRAND_CONFIG.COMPANY_NAME}. Bằng cách truy cập hoặc sử dụng Dịch vụ của chúng tôi, bạn
                            đồng ý bị ràng buộc bởi các Điều khoản này và Chính sách Quyền riêng tư của chúng tôi.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-l-4 border-brand pl-4">
                            2. Điều kiện Sử dụng
                        </h2>
                        <p className="mt-4 text-gray-700 dark:text-gray-300 leading-7">
                            Bạn phải từ 13 tuổi trở lên (hoặc độ tuổi tối thiểu theo quy định pháp luật tại quốc gia của
                            bạn để sử dụng các dịch vụ không cần sự đồng ý của phụ huynh). Nếu bạn dưới 18 tuổi, bạn xác
                            nhận rằng bạn đã có sự cho phép của cha mẹ hoặc người giám hộ hợp pháp để sử dụng Dịch vụ.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-l-4 border-brand pl-4">
                            3. Tài khoản của bạn
                        </h2>
                        <p className="mt-4 text-gray-700 dark:text-gray-300 leading-7">
                            <strong>Tạo tài khoản:</strong> Để sử dụng đầy đủ các tính năng của {BRAND_CONFIG.APP_NAME},
                            bạn có thể cần phải đăng ký một tài khoản. Bạn có thể tạo tài khoản trực tiếp hoặc thông qua
                            dịch vụ của bên thứ ba như Google (Google OAuth).
                        </p>
                        <p className="mt-4 text-gray-700 dark:text-gray-300 leading-7">
                            <strong>Sử dụng Google OAuth:</strong> Nếu bạn chọn tạo tài khoản bằng Google, bạn cho phép
                            chúng tôi truy cập và sử dụng một số thông tin từ tài khoản Google của bạn, chẳng hạn như
                            tên, địa chỉ email và ảnh đại diện, để tạo và quản lý tài khoản {BRAND_CONFIG.APP_NAME} của
                            bạn. Việc sử dụng dữ liệu của bạn sẽ tuân thủ Chính sách Quyền riêng tư của chúng tôi.
                        </p>
                        <p className="mt-4 text-gray-700 dark:text-gray-300 leading-7">
                            <strong>Trách nhiệm về tài khoản:</strong> Bạn hoàn toàn chịu trách nhiệm về mọi hoạt động
                            diễn ra trên tài khoản của mình và phải bảo mật mật khẩu. Bạn đồng ý thông báo ngay cho
                            chúng tôi về bất kỳ hành vi sử dụng trái phép nào đối với tài khoản của bạn.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-l-4 border-brand pl-4">
                            4. Nội dung do Người dùng Tạo
                        </h2>
                        <p className="mt-4 text-gray-700 dark:text-gray-300 leading-7">
                            <strong>Quyền sở hữu của bạn:</strong> Bạn giữ mọi quyền sở hữu đối với nội dung (bao gồm
                            video, bình luận, âm thanh, văn bản và hình ảnh) mà bạn đăng tải lên Dịch vụ (&quot;Nội dung
                            của bạn&quot;).
                        </p>
                        <p className="mt-4 text-gray-700 dark:text-gray-300 leading-7">
                            <strong>Giấy phép cấp cho chúng tôi:</strong> Bằng cách gửi Nội dung của bạn, bạn cấp cho{" "}
                            {BRAND_CONFIG.COMPANY_NAME} một giấy phép không độc quyền, có thể chuyển nhượng, có thể cấp
                            phép lại, miễn phí bản quyền và trên toàn thế giới để sử dụng, sao chép, sửa đổi, tạo các
                            tác phẩm phái sinh, phân phối, trình diễn công khai, và hiển thị Nội dung của bạn liên quan
                            đến việc vận hành, quảng bá và cải thiện Dịch vụ. Giấy phép này cho phép chúng tôi thực hiện
                            các hành động như định dạng lại video của bạn để xem trên di động hoặc hiển thị nó trên các
                            phần khác nhau của ứng dụng.
                        </p>
                        <p className="mt-4 text-gray-700 dark:text-gray-300 leading-7">
                            <strong>Trách nhiệm của bạn:</strong> Bạn tuyên bố và đảm bảo rằng bạn sở hữu hoặc có tất cả
                            các quyền, giấy phép, sự đồng ý và quyền hạn cần thiết để cấp phép cho chúng tôi sử dụng Nội
                            dung của bạn, và nội dung đó không vi phạm bản quyền, nhãn hiệu thương mại, quyền riêng tư
                            hoặc bất kỳ quyền nào khác của bất kỳ bên thứ ba nào.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-l-4 border-brand pl-4">
                            5. Các hoạt động bị cấm và Quy tắc Cộng đồng
                        </h2>
                        <p className="mt-4 text-gray-700 dark:text-gray-300 leading-7">
                            Bạn đồng ý không tham gia vào bất kỳ hoạt động nào sau đây:
                        </p>
                        <ul className="mt-4 space-y-4 text-gray-700 dark:text-gray-300 leading-7 list-disc list-inside">
                            <li>
                                Đăng tải nội dung bất hợp pháp, bạo lực, thù địch, khiêu dâm, hoặc phân biệt đối xử.
                            </li>
                            <li>Bắt nạt, quấy rối, đe dọa hoặc mạo danh người khác.</li>
                            <li>
                                Vi phạm quyền sở hữu trí tuệ của người khác, bao gồm bản quyền và nhãn hiệu thương mại.
                            </li>
                            <li>Đăng tải thông tin sai lệch hoặc tin giả có thể gây hại.</li>
                            <li>Sử dụng Dịch vụ cho mục đích spam hoặc các hoạt động thương mại trái phép.</li>
                            <li>Tải lên vi-rút, phần mềm độc hại hoặc mã độc khác.</li>
                            <li>
                                Cố gắng truy cập trái phép vào hệ thống, tài khoản của người dùng khác, hoặc sử dụng các
                                công cụ tự động để thu thập dữ liệu (scraping) mà không có sự cho phép của chúng tôi.
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-l-4 border-brand pl-4">
                            6. Kiểm duyệt Nội dung
                        </h2>
                        <p className="mt-4 text-gray-700 dark:text-gray-300 leading-7">
                            Chúng tôi có quyền, nhưng không có nghĩa vụ, xem xét, lọc, hoặc gỡ bỏ nội dung vi phạm các
                            Điều khoản này hoặc pháp luật hiện hành. Chúng tôi có thể sử dụng cả hệ thống tự động và
                            người kiểm duyệt để giám sát nội dung trên nền tảng nhằm bảo vệ cộng đồng và Dịch vụ của
                            chúng tôi. Việc vi phạm nhiều lần có thể dẫn đến việc đình chỉ hoặc chấm dứt tài khoản của
                            bạn.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-l-4 border-brand pl-4">
                            7. Sở hữu Trí tuệ và Bản quyền
                        </h2>
                        <p className="mt-4 text-gray-700 dark:text-gray-300 leading-7">
                            <strong>Sở hữu của chúng tôi:</strong> Tất cả các quyền, tiêu đề và lợi ích đối với Dịch vụ
                            (không bao gồm Nội dung của bạn), bao gồm tất cả các quyền sở hữu trí tuệ liên quan, là và
                            sẽ vẫn là tài sản độc quyền của {BRAND_CONFIG.COMPANY_NAME}.
                        </p>
                        <p className="mt-4 text-gray-700 dark:text-gray-300 leading-7">
                            <strong>Báo cáo Vi phạm Bản quyền (DMCA):</strong> Chúng tôi tôn trọng quyền sở hữu trí tuệ
                            của người khác và mong muốn người dùng cũng làm như vậy. Nếu bạn tin rằng nội dung của mình
                            đã bị sao chép theo cách cấu thành hành vi vi phạm bản quyền, vui lòng cung cấp cho chúng
                            tôi thông tin chi tiết qua email liên hệ của chúng tôi.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-l-4 border-brand pl-4">
                            8. Chấm dứt
                        </h2>
                        <p className="mt-4 text-gray-700 dark:text-gray-300 leading-7">
                            Chúng tôi có quyền đình chỉ hoặc chấm dứt quyền truy cập của bạn vào Dịch vụ bất cứ lúc nào,
                            với hoặc không có lý do, nếu bạn vi phạm các Điều khoản này. Bạn có thể xóa tài khoản của
                            mình bất cứ lúc nào bằng cách làm theo hướng dẫn trong phần cài đặt của ứng dụng.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-l-4 border-brand pl-4">
                            9. Tuyên bố Miễn trừ Trách nhiệm
                        </h2>
                        <p className="mt-4 text-gray-700 dark:text-gray-300 leading-7">
                            Dịch vụ được cung cấp &quot;nguyên trạng&quot; (&quot;as is&quot;) và &quot;như có sẵn&quot;
                            (&quot;as available&quot;) mà không có bất kỳ bảo đảm nào, dù rõ ràng hay ngụ ý. Chúng tôi
                            không đảm bảo rằng Dịch vụ sẽ không bị gián đoạn, an toàn hoặc không có lỗi.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-l-4 border-brand pl-4">
                            10. Giới hạn Trách nhiệm
                        </h2>
                        <p className="mt-4 text-gray-700 dark:text-gray-300 leading-7">
                            Trong phạm vi tối đa được pháp luật cho phép, {BRAND_CONFIG.COMPANY_NAME} sẽ không chịu
                            trách nhiệm pháp lý đối với bất kỳ thiệt hại gián tiếp, ngẫu nhiên, đặc biệt, do hậu quả
                            hoặc trừng phạt nào, hoặc bất kỳ tổn thất nào về lợi nhuận hoặc doanh thu, dù phát sinh trực
                            tiếp hay gián tiếp, phát sinh từ việc bạn sử dụng Dịch vụ.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-l-4 border-brand pl-4">
                            11. Luật điều chỉnh
                        </h2>
                        <p className="mt-4 text-gray-700 dark:text-gray-300 leading-7">
                            Các Điều khoản này sẽ được điều chỉnh và giải thích theo luật pháp của{" "}
                            {BRAND_CONFIG.JURISDICTION}, không tính đến các nguyên tắc xung đột pháp luật.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-l-4 border-brand pl-4">
                            12. Thay đổi đối với Điều khoản này
                        </h2>
                        <p className="mt-4 text-gray-700 dark:text-gray-300 leading-7">
                            Chúng tôi có thể sửa đổi các Điều khoản này theo thời gian. Nếu chúng tôi thực hiện các thay
                            đổi quan trọng, chúng tôi sẽ thông báo cho bạn bằng cách đăng phiên bản cập nhật trên trang
                            này và/hoặc qua các phương tiện liên lạc khác. Việc bạn tiếp tục sử dụng Dịch vụ sau khi các
                            thay đổi có hiệu lực có nghĩa là bạn đồng ý với các Điều khoản đã sửa đổi.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-l-4 border-brand pl-4">
                            13. Liên hệ với chúng tôi
                        </h2>
                        <p className="mt-4 text-gray-700 dark:text-gray-300 leading-7">
                            Nếu bạn có bất kỳ câu hỏi nào về các Điều khoản này, vui lòng liên hệ với chúng tôi tại{" "}
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
