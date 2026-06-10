export const WELLNESS_RULE_TYPES = {
    CONTINUOUS_USAGE: 'continuous_usage',
    DAILY_LIMIT: 'daily_limit',
    VIDEO_WATCH_TIME: 'video_watch_time',
    LATE_NIGHT: 'late_night'
} as const

export const WELLNESS_ACTIONS = {
    WARNING: 'warning',
    SOFT_BLOCK: 'soft_block'
} as const

export const WELLNESS_PERIODS = {
    TODAY: 'today',
    WEEK: 'week',
    MONTH: 'month'
} as const

export const WELLNESS_RULE_TYPE_LABELS = {
    continuous_usage: 'Sử dụng liên tục',
    daily_limit: 'Giới hạn hàng ngày',
    video_watch_time: 'Thời gian xem video',
    late_night: 'Sử dụng khuya'
} as const

export const WELLNESS_ACTION_LABELS = {
    warning: 'Hiển thị cảnh báo',
    soft_block: 'Yêu cầu xác nhận'
} as const
