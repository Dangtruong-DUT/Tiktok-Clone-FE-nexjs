export const VIDEO_UPLOAD_ERROR = {
    INVALID_RESPONSE: 'invalid_response',
    UNAUTHORIZED: 'unauthorized',
    SERVER_ERROR: 'server_error',
    NETWORK_ERROR: 'network_error',
} as const

export type VideoUploadErrorCode = (typeof VIDEO_UPLOAD_ERROR)[keyof typeof VIDEO_UPLOAD_ERROR]

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
