<?php

return [

    'large_video_notice' => 'Video của bạn khá lớn. Để phân tích chính xác hơn, bạn có thể mô tả nội dung video hoặc chọn đoạn muốn tập trung.',

    'routes' => [
        'upload' => [
            'label'       => 'Đăng video mới',
            'description' => 'Tải lên và chỉnh sửa video mới của bạn',
        ],
        'scheduled_posts' => [
            'label'       => 'Bài đăng đã lên lịch',
            'description' => 'Xem và quản lý các bài đăng đã lên lịch',
        ],
        'content' => [
            'label'       => 'Quản lý bài đăng',
            'description' => 'Xem toàn bộ bài đăng của bạn',
        ],
        'wellness' => [
            'label'       => 'Wellness & Screen Time',
            'description' => 'Theo dõi thời gian sử dụng và thiết lập giới hạn lành mạnh',
        ],
        'settings' => [
            'label'       => 'Cài đặt tài khoản',
            'description' => 'Chỉnh sửa hồ sơ, mật khẩu và tuỳ chọn bảo mật',
        ],
        'appeals' => [
            'label'       => 'Khiếu nại kiểm duyệt',
            'description' => 'Gửi và theo dõi khiếu nại về các quyết định kiểm duyệt',
        ],
        'admin' => [
            'label'       => 'Admin Dashboard',
            'description' => 'Bảng điều khiển quản trị hệ thống',
        ],
        'home' => [
            'label'       => 'Tổng quan Snapi Studio',
            'description' => 'Trang tổng quan Snapi Studio của bạn',
        ],
    ],

    'messages' => [
        'clarification' => 'Mình chưa hiểu rõ yêu cầu. Bạn muốn tạo nội dung, xem thống kê, hỏi hướng dẫn, hay phân tích video?',
        'navigation_all' => 'Dưới đây là tất cả các trang trong Snapi Studio:',
        'navigation_matched' => 'Tìm thấy trang phù hợp với yêu cầu của bạn:',
        'analytics_clarification' => 'Bạn muốn xem thống kê gì cụ thể? Ví dụ: bài đăng, người dùng, AI, kháng cáo, hoặc hệ thống.',
        'analytics_empty' => 'Không tìm thấy dữ liệu phù hợp với yêu cầu. Bạn có thể hỏi cụ thể hơn không?',
        'app_knowledge_fallback' => <<<'MD'
## Snapi Studio — Hướng dẫn sử dụng

Snapi Studio là nền tảng sáng tạo nội dung short-form video.

### Tính năng chính
- **Đăng video**: Tải lên, chỉnh sửa thumbnail, caption, hashtag, lên lịch hoặc đăng ngay
- **AI Copilot**: Viết caption/hashtag, phân tích viral, hook, retention; hỗ trợ tiếng Việt và tiếng Anh
- **Thống kê**: Xem lượt xem, likes, followers, screen time
- **Wellness**: Theo dõi và giới hạn thời gian sử dụng
- **Khiếu nại**: Gửi kháng cáo quyết định kiểm duyệt

Hỏi tôi về bất kỳ tính năng nào để biết thêm chi tiết!
MD,
    ],

    'errors' => [
        'rate_limited'      => 'AI đang bận xử lý nhiều yêu cầu. Vui lòng thử lại sau vài giây.',
        'overloaded'        => 'AI hiện đang quá tải. Vui lòng thử lại sau.',
        'invalid_config'    => 'Cấu hình AI không hợp lệ. Vui lòng kiểm tra API key trong cài đặt.',
        'permission_denied' => 'API key không có quyền truy cập model này.',
        'generic'           => 'Đã xảy ra lỗi khi kết nối với AI. Vui lòng thử lại.',
    ],

    'labels' => [
        'suggestion' => 'Gợi ý',
    ],

    /*
    |--------------------------------------------------------------------------
    | Follow-up chips (Vietnamese)
    |--------------------------------------------------------------------------
    | Short suggestion buttons shown below each AI response.
    | Keys map to intent values; fallback key is 'default'.
    */
    'chips' => [
        'write_caption'    => ['Ngắn hơn', 'Tạo hashtag', 'Phân tích viral', 'Đề xuất CTA'],
        'write_title'      => ['Viết caption', 'Tạo hashtag', 'Viết mô tả'],
        'write_description' => ['Viết caption', 'Tạo hashtag', 'Rút gọn mô tả'],
        'rewrite_content'  => ['Ngắn hơn', 'Thu hút hơn', 'Thêm CTA'],
        'suggest_cta'      => ['Viết caption', 'Tạo hashtag', 'Phân tích CTA'],
        'content_generation' => ['Viết caption', 'Tạo hashtag', 'Phân tích viral'],
        'generate_hashtags' => ['Viết caption', 'Phân tích viral', 'Đề xuất CTA'],
        'analyze_viral'    => ['Cải thiện như thế nào?', 'Viết caption hay hơn', 'Đề xuất CTA', 'Phân tích hook'],
        'analyze_video'    => ['Phân tích hook', 'Viết caption', 'Tạo hashtag', 'Phân tích viral'],
        'analyze_hook'     => ['Viết lại hook', 'Phân tích retention', 'Viết caption'],
        'analyze_retention' => ['Cải thiện hook', 'Phân tích viral', 'Đề xuất CTA'],
        'analyze_cta'      => ['Viết CTA mới', 'Viết caption', 'Phân tích viral'],
        'analyze_audience' => ['Gợi ý caption', 'Phân tích viral', 'Tạo hashtag'],
        'analyze_frame'    => ['Phân tích toàn video', 'Viết caption', 'Gợi ý thumbnail'],
        'analyze_video_segment' => ['Phân tích toàn video', 'Viết caption đoạn này', 'Phân tích viral'],
        'video_review'     => ['Phân tích hook', 'Phân tích viral', 'Viết caption'],
        'analytics'        => ['Xem thống kê khác', 'So sánh kỳ trước', 'Phân tích chi tiết hơn'],
        'analytics_post'   => ['So sánh kỳ trước', 'Xem chi tiết tương tác', 'Thống kê người dùng'],
        'analytics_user_growth' => ['Thống kê bài đăng', 'So sánh tháng trước', 'Top creators'],
        'analytics_clarification' => ['Thống kê bài đăng', 'Thống kê người dùng', 'Chi phí AI', 'Thống kê hệ thống'],
        'analytics_empty'  => ['Thống kê bài đăng', 'Thống kê người dùng', 'Thống kê hệ thống'],
        'navigation'       => ['Đăng video mới', 'Xem bài đăng của tôi', 'Cài đặt tài khoản'],
        'app_knowledge'    => ['Hướng dẫn đăng video', 'AI Copilot làm được gì?', 'Đường đến trang cài đặt'],
        'large_video_notice' => ['Mô tả video của tôi', 'Chọn một đoạn video', 'Phân tích hook'],
        'clarification'    => ['Viết caption', 'Xem thống kê', 'Hỏi hướng dẫn', 'Phân tích video'],
        'schedule_post'    => ['Viết caption', 'Tạo hashtag', 'Phân tích viral'],
        'error'            => ['Thử lại', 'Hỏi câu khác'],
        'default'          => ['Viết caption', 'Tạo hashtag', 'Phân tích viral', 'Phân tích hook'],
    ],

];
