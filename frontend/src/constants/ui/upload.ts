export const VIDEO_UPLOAD_ERROR = {
    INVALID_RESPONSE: 'invalid_response',
    UNAUTHORIZED: 'unauthorized',
    SERVER_ERROR: 'server_error',
    NETWORK_ERROR: 'network_error',
    SESSION_INIT_FAILED: 'session_init_failed',
    VERIFICATION_FAILED: 'verification_failed'
} as const

export type VideoUploadErrorCode = (typeof VIDEO_UPLOAD_ERROR)[keyof typeof VIDEO_UPLOAD_ERROR]

export const UPLOAD_CONSTRAINTS = {
    image: {
        maxSizeKb: 10240,
        mimes: ['jpg', 'jpeg', 'png'] as const,
        mimeTypes: ['image/jpeg', 'image/png'] as const
    },
    video: {
        maxSizeBytes: 500 * 1024 * 1024, // 500 MB
        mimes: ['mp4', 'mov', 'webm'] as const,
        mimeTypes: ['video/mp4', 'video/quicktime', 'video/webm'] as const
    }
} as const

export const MULTIPART_CONFIG = {
    thresholdBytes: 50 * 1024 * 1024, // files ≥ 50 MB use multipart
    chunkSizeBytes: 15 * 1024 * 1024, // 15 MB per chunk
    maxConcurrency: 5 // 5 chunks in parallel
} as const

export type UploadConstraintType = keyof typeof UPLOAD_CONSTRAINTS
