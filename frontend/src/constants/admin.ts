// Values must match backend PHP enums exactly
export const ADMIN_ACTIONS = {
    BAN: 'ban',
    UNBAN: 'unban',
    DELETE_USER: 'delete_user',
    RESTORE_USER: 'restore_user',
    RESET_USER_PASSWORD: 'reset_user_password',
    SEND_EMAIL_TO_USER: 'send_email_to_user',
    DELETE_POST: 'delete_post',
    RESTORE_POST: 'restore_post',
    DELETE_COMMENT: 'delete_comment',
    RESTORE_COMMENT: 'restore_comment',
    APPROVE_APPEAL: 'approve_appeal',
    REJECT_APPEAL: 'reject_appeal',
    UPDATE: 'update'
} as const

export type AdminAction = (typeof ADMIN_ACTIONS)[keyof typeof ADMIN_ACTIONS]

export const ADMIN_RESOURCE_TYPES = {
    USER: 'user',
    POST: 'post',
    COMMENT: 'comment',
    MESSAGE: 'message',
    APPEAL: 'appeal',
    RE_POST: 're-post',
    QUOTE_POST: 'quote-post'
} as const

export type AdminResourceType = (typeof ADMIN_RESOURCE_TYPES)[keyof typeof ADMIN_RESOURCE_TYPES]
