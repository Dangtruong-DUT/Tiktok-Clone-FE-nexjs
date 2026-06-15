<?php

return [
    // Exception class defaults
    'not_found'           => 'Không tìm thấy tài nguyên',
    'forbidden'           => 'Không có quyền truy cập',
    'unauthorized'        => 'Chưa xác thực',
    'bad_request'         => 'Yêu cầu không hợp lệ',
    'conflict'            => 'Xung đột dữ liệu',
    'business'            => 'Lỗi nghiệp vụ',
    'jwt'                 => 'Lỗi xác thực JWT',
    'too_many_requests'   => 'Quá nhiều yêu cầu. Vui lòng thử lại sau.',
    'service_unavailable' => 'Dịch vụ tạm thời không khả dụng.',
    'internal'            => 'Lỗi máy chủ nội bộ',
    'validation'          => 'Dữ liệu không hợp lệ',

    // Domain-specific
    'post' => [
        'not_found'          => 'Không tìm thấy bài viết',
        'parent_not_found'   => 'Không tìm thấy bài viết cha',
        'forbidden_update'   => 'Bạn chỉ có thể chỉnh sửa bài viết của mình',
        'forbidden_delete'   => 'Bạn chỉ có thể xoá bài viết của mình',
        'parent_required'    => 'Loại bài viết này yêu cầu bài viết cha.',
        'parent_not_allowed' => 'Loại bài viết này không cho phép bài viết cha.',
        'no_fields'          => 'Phải cung cấp ít nhất một trường để cập nhật',
        'already_liked'      => 'Bạn đã thích bài viết này rồi',
        'not_liked'          => 'Bạn chưa thích bài viết này',
        'already_bookmarked' => 'Bạn đã lưu bài viết này rồi',
        'not_bookmarked'     => 'Bạn chưa lưu bài viết này',
        'already_deleted'    => 'Bài viết đã bị xoá trước đó',
        'not_a_post'         => 'Tài nguyên này không phải là bài viết',
    ],
    'schedule' => [
        'not_found'              => 'Không tìm thấy lịch đăng',
        'not_pending'            => 'Chỉ có thể huỷ lịch đăng đang chờ',
        'not_pending_reschedule' => 'Chỉ có thể đổi lịch khi lịch đăng đang ở trạng thái chờ.',
        'conflict'               => 'Bài viết đã có lịch đăng đang hoạt động',
        'already_published'      => 'Bài viết đã được đăng',
        'forbidden_post'         => 'Bạn không sở hữu bài viết này.',
        'forbidden_schedule'     => 'Bạn không sở hữu lịch đăng này.',
        'invalid_status'         => 'Chỉ có thể lên lịch các bài viết ở trạng thái nháp hoặc thất bại.',
        'already_scheduled'      => 'Bài viết này đã được lên lịch. Hãy huỷ lịch cũ trước.',
        'time_in_future'         => 'Thời gian lên lịch phải ở trong tương lai.',
        'invalid_status_publish' => 'Bài viết không thể đăng ở trạng thái hiện tại.',
    ],
    'video' => [
        'encoding_retry' => 'Chỉ có thể thử lại mã hoá khi trạng thái là FAILED',
        'linked_to_post' => 'Không thể xoá video đang được liên kết với bài viết',
    ],
    'auth' => [
        'invalid_credentials' => 'Thông tin đăng nhập không đúng',
        'email_not_verified'  => 'Email chưa được xác thực',
        'token_expired'       => 'Phiên đăng nhập hết hạn',
        'token_invalid'       => 'Phiên đăng nhập không hợp lệ',
    ],
    'ai' => [
        'copilot_disabled' => 'AI Copilot hiện đang bị tắt.',
    ],
    'wellness' => [
        'session_ended' => 'Phiên theo dõi đã kết thúc.',
    ],
];
