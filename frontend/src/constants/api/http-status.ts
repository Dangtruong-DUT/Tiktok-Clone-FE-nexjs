export const HTTP_STATUS = {
    OK: 200,
    UNAUTHORIZED: 401,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500,
    BAD_REQUEST: 400,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    TOO_MANY_REQUESTS: 429
} as const

export type HttpStatusCode = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS]
