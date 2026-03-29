export const UPLOAD_CONSTRAINTS = {
    image: {
        maxSizeKb: 10240,
        mimes: ['jpg', 'jpeg', 'png'] as const,
        mimeTypes: ['image/jpeg', 'image/png'] as const
    },
    video: {
        maxSizeKb: 51200,
        mimes: ['mp4', 'mov'] as const,
        mimeTypes: ['video/mp4', 'video/quicktime'] as const
    }
} as const

export type UploadConstraintType = keyof typeof UPLOAD_CONSTRAINTS
