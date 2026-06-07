<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Intent keyword rules (Vietnamese)
    |--------------------------------------------------------------------------
    | Used by AiCopilotIntentDetector::detectByKeyword() to match user messages.
    | Add new keywords here — no code changes required.
    */
    'intent_keywords' => [
        'query_user_stats' => [
            'thống kê của tôi', 'thông tin tài khoản', 'bao nhiêu follow',
            'profile của tôi', 'followers của tôi', 'thông tin cá nhân',
            'số follow', 'số người theo dõi', 'số lượng follow',
            'tài khoản của tôi', 'thống kê tài khoản',
            'tôi là ai', 'tên của tôi', 'email của tôi', 'avatar của tôi',
            'tổng view của tôi', 'tổng like của tôi', 'hồ sơ của tôi',
            'xem profile của tôi', 'thông tin về tôi', 'cá nhân tôi',
            'số bài đăng của tôi', 'tổng số bài', 'số bài lên lịch',
            'tổng like tôi có', 'tổng view tôi có',
            'tình trạng appeal của tôi', 'khiếu nại của tôi', 'appeal của tôi',
            'bao nhiêu appeal', 'kháng cáo của tôi', 'hồ sơ cá nhân',
            'tôi đang có bao nhiêu', 'tài khoản trông như thế nào',
        ],
        'admin_query_appeals' => [
            'kháng cáo chờ', 'kháng cáo đang chờ', 'danh sách kháng cáo',
            'xem kháng cáo', 'kháng cáo chi tiết', 'thống kê kháng cáo',
        ],
        'admin_query_ai_metrics' => [
            'chi phí ai hôm nay', 'chi phí ai', 'thống kê ai chi tiết',
            'top intent', 'top user ai', 'doanh thu ai',
            'copilot usage', 'ai metrics', 'thống kê ai', 'chi phí copilot',
            'ai hệ thống', 'token', 'số token', 'tổng token',
            'token hệ thống', 'chi phí token', 'ai token', 'bao nhiêu token',
            'token đã dùng', 'tiêu tốn token',
        ],
        'admin_query_encoding' => [
            'video lỗi encoding', 'video encoding errors', 'hàng đợi encoding',
            'encoding queue', 'video lỗi mã hoá', 'video đang mã hoá',
            'encoding failures', 'encoding status', 'job encoding',
        ],
        'admin_query_stats' => [
            'thống kê hệ thống', 'tổng số người dùng',
            'bao nhiêu bài đăng trên hệ thống', 'tổng số video hệ thống',
            'người dùng mới hôm nay', 'đăng ký mới', 'lượng truy cập',
            'hệ thống hôm nay', 'báo cáo hệ thống', 'thống kê nền tảng',
            'bao nhiêu user', 'bao nhiêu người dùng hoạt động',
            'tổng số tài khoản', 'thống kê toàn hệ thống', 'tổng số bài trên app',
            'hệ thống có bao nhiêu', 'số người dùng hệ thống',
            'người dùng hệ thống', 'số lượng người dùng',
            'số người dùng hiện tại', 'người dùng hiện tại',
            'người dùng trong hệ thống',
        ],
        'query_post_stats' => [
            'bài đăng của tôi', 'post gần nhất', 'video của tôi',
            'bài đăng gần đây', 'bao nhiêu bài', 'thống kê bài đăng',
            'số bài đăng', 'số video', 'số lượng bài', 'số lượng video',
            'bài đăng hiện tại', 'tổng bài đăng', 'tổng bài của tôi',
            'đăng được bao nhiêu', 'bài nào nhiều view nhất', 'bài đăng thất bại',
            'bài nháp', 'bài đang chờ', 'trạng thái bài đăng',
            'bài có bao nhiêu view', 'hiệu suất bài', 'bài hôm nay',
            'đã đăng bao nhiêu', 'video nào hot nhất', 'thống kê chi tiết bài',
            'bài đăng hiệu quả nhất', 'bài đang lên lịch',
            'video của tôi đang như thế nào', 'xem danh sách bài', 'bài mới đăng',
        ],
        'query_notifications' => [
            'thông báo', 'thông báo hôm nay', 'thông báo chưa đọc',
            'tôi có bao nhiêu thông báo', 'xem thông báo', 'danh sách thông báo',
            'ai like bài của tôi', 'ai follow tôi', 'ai mention tôi',
            'chưa đọc', 'thông báo mới',
        ],
        'query_screen_time' => [
            'thời gian sử dụng', 'xem bao lâu', 'lịch sử xem',
            'thói quen xem', 'thống kê thời gian', 'phân tích screen time',
            'screen time của tôi', 'screen time hôm nay', 'thời gian dùng app',
            'thời gian online', 'thời gian trên app', 'bao lâu tôi dùng',
            'dùng app bao lâu', 'tôi đã dùng bao lâu',
            'thời gian sử dụng ứng dụng', 'tôi online bao lâu', 'tôi đã xem bao lâu',
        ],
        'schedule_post' => [
            'lên lịch', 'đăng lúc', 'đăng vào', 'đăng lúc nào',
            'thời gian đăng', 'đặt lịch', 'lên lịch đăng', 'đăng vào ngày',
            'đăng vào giờ', 'hẹn giờ', 'khi nào nên đăng',
            'thời điểm đăng tốt nhất', 'đăng ngày mai', 'đăng tuần sau',
            'gợi ý giờ đăng', 'đăng lúc mấy giờ thì tốt',
            'đăng vào khung giờ nào', 'tôi muốn lên lịch',
        ],
        'write_caption' => [
            'caption', 'viết caption', 'tạo caption',
            'viết nội dung', 'viết content', 'tạo content',
            'tạo nội dung', 'nội dung bài đăng', 'đưa vào bài', 'áp dụng vào bài',
            'đặt caption', 'thêm caption', 'chữ bài đăng',
            'gợi ý caption', 'viết cho video này', 'caption hay',
            'nội dung hấp dẫn', 'viết bài đăng', 'giúp tôi viết',
            'content cho video', 'đề xuất caption', 'tạo nội dung hay',
            'viết nội dung cho video', 'tạo mô tả video',
        ],
        'write_title' => [
            'tiêu đề', 'tạo tiêu đề', 'đặt tiêu đề',
            'tên video', 'gợi ý tiêu đề',
        ],
        'write_description' => [
            'mô tả', 'viết mô tả', 'tạo mô tả', 'mô tả video',
            'giới thiệu video', 'tạo mô tả video', 'viết mô tả video',
        ],
        'generate_hashtags' => [
            'hashtag', 'tag', 'thẻ', 'tạo hashtag', 'viết hashtag',
            'gợi ý hashtag', 'hashtags cho', 'thêm hashtag',
            '#', 'tag phù hợp', 'gợi ý tag', 'tag nào dùng',
            'thẻ hashtag', 'hashtag phổ biến', 'tag cho video',
            'cần hashtag gì', 'tag liên quan', 'hashtag hay', 'các hashtag',
        ],
        'rewrite_content' => [
            'viết lại', 'cải thiện', 'sửa', 'làm lại', 'nâng cấp',
            'tối ưu', 'chỉnh sửa', 'hay hơn', 'tốt hơn',
            'chỉnh lại', 'sửa lại cho tốt hơn', 'cải tiến',
            'làm hay hơn', 'nâng cao chất lượng',
        ],
        'analyze_video' => [
            'phân tích video', 'analyze video', 'đánh giá video',
            'review video', 'nhận xét video', 'feedback video', 'góp ý video',
            'video này thế nào', 'đánh giá video này', 'nhận xét về video',
            'video tốt không', 'có nên đăng không', 'video hay không',
            'chất lượng video', 'xem video của tôi',
            'video này ok không', 'phân tích nội dung video',
        ],
        'analyze_viral' => [
            'viral', 'xu hướng', 'trend', 'lan truyền',
            'tiềm năng viral', 'có viral không', 'có xu hướng không',
            'viral được không', 'có thể trending không', 'khả năng viral',
            'đánh giá viral', 'có thể nổi không',
            'có thể lên trend không', 'video có hot không',
        ],
        'analyze_hook' => [
            'hook', 'mở đầu', 'intro', 'giây đầu', 'opening',
            '3 giây đầu', 'phần mở', 'bắt đầu video',
            'hook có hay không', 'mở đầu có cuốn không',
            'giây đầu tiên', 'phần intro',
        ],
        'analyze_retention' => [
            'retention', 'giữ chân', 'xem hết', 'watch time',
            'người xem bỏ', 'tỉ lệ xem', 'completion rate',
            'người xem có xem hết không', 'tỉ lệ hoàn thành',
            'drop off', 'thời lượng xem',
        ],
        'suggest_cta' => [
            'viết cta', 'gợi ý cta', 'tạo cta', 'thêm cta', 'cta cho video',
            'lời kêu gọi', 'viết lời kêu gọi', 'gợi ý lời kêu gọi',
        ],
        'analyze_cta' => [
            'phân tích cta', 'đánh giá cta', 'cta có hiệu quả không',
            'cta tốt không', 'cta của tôi thế nào',
            'kêu gọi hành động có tốt không', 'cta có ổn không',
            'đánh giá lời kêu gọi',
        ],
        'analyze_audience' => [
            'audience', 'đối tượng', 'target', 'khán giả',
            'phù hợp ai', 'xem nhiều',
        ],
        'navigate_to' => [
            'đường đến', 'tới trang', 'chuyển đến', 'link tới',
            'tìm ở đâu', 'ở đâu trong app', 'dẫn đến trang',
            'trang nào', 'mở trang', 'đến trang', 'truy cập trang',
        ],
        'query_app_info' => [
            'snapi là gì', 'tính năng nào', 'web làm được gì',
            'hướng dẫn sử dụng snapi', 'app có gì', 'giới thiệu snapi',
            'snapi có thể', 'làm thế nào để dùng', 'cách để dùng snapi',
            'cách dùng snapi', 'hướng dẫn snapi', 'chức năng snapi',
            'tính năng của snapi', 'snapi hỗ trợ gì', 'có thể làm gì trên snapi',
            'giải thích tính năng', 'snapi studio có', 'tôi cần làm gì để dùng',
            'chính sách', 'điều khoản', 'quy định',
            'chức năng này là gì', 'trang này là gì',
            'snapi hoạt động như thế nào', 'ai copilot là gì',
            'wellness là gì', 'screen time là gì', 'studio có tính năng gì',
            'tôi muốn biết về snapi', 'giới thiệu tính năng snapi',
        ],
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
        'generate_hashtags' => ['Viết caption', 'Phân tích viral', 'Đề xuất CTA'],
        'analyze_viral'    => ['Cải thiện như thế nào?', 'Viết caption hay hơn', 'Đề xuất CTA', 'Phân tích hook'],
        'analyze_video'    => ['Phân tích hook', 'Viết caption', 'Tạo hashtag', 'Phân tích viral'],
        'schedule_post'    => ['Viết caption', 'Tạo hashtag', 'Phân tích viral'],
        'error'            => ['Thử lại', 'Hỏi câu khác'],
        'default'          => ['Viết caption', 'Tạo hashtag', 'Phân tích viral', 'Phân tích hook'],
    ],

    /*
    |--------------------------------------------------------------------------
    | Admin-only intents
    |--------------------------------------------------------------------------
    | Intents that must only fire for users with role = super_admin.
    */
    'admin_only_intents' => [
        'admin_query_stats',
        'admin_query_appeals',
        'admin_query_ai_metrics',
        'admin_query_encoding',
    ],

];
