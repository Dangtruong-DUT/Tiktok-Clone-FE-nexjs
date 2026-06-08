export const VideoDialogTab = {
    COMMENTS: 'comments',
    CREATOR: 'creator'
} as const

export type VideoDialogTabType = (typeof VideoDialogTab)[keyof typeof VideoDialogTab]

export const ModalVideoDetailType = {
    COMMENTS: 'commentsVideoDetail',
    MODAL: 'modalVideoDetail'
} as const

export type ModalVideoDetailTypeValue = (typeof ModalVideoDetailType)[keyof typeof ModalVideoDetailType]
