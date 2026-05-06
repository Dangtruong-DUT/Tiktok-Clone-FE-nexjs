export const getAppealTypeLabel = (type: string | undefined, t: (key: string) => string) => {
    if (!type) return ''
    switch (type) {
        case 'user_ban':
            return t('types.user_ban')
        case 'user_deleted':
            return t('types.user_deleted')
        case 'post_deleted':
            return t('types.post_deleted')
        case 'comment_deleted':
            return t('types.comment_deleted')
        default:
            return type
    }
}

export const getAppealStatusLabel = (status: string | undefined, t: (key: string) => string) => {
    if (!status) return ''
    switch (status) {
        case 'pending':
            return t('statuses.pending')
        case 'approved':
            return t('statuses.approved')
        case 'rejected':
            return t('statuses.rejected')
        default:
            return status
    }
}
