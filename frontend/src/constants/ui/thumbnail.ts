export const SelectThumbnailMode = {
    UPLOAD: 'UPLOAD',
    SELECT_FROM_VIDEO: 'SELECT_FROM_VIDEO'
} as const

export type SelectThumbnailModeType = (typeof SelectThumbnailMode)[keyof typeof SelectThumbnailMode]
