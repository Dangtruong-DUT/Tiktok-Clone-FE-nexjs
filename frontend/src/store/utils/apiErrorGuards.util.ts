import { HTTP_STATUS } from '@/constants/api/http-status'
import { BusinessException } from '@/types/common/http-response.type'
import { FetchBaseQueryError } from '@reduxjs/toolkit/query'

export function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
    return typeof error === 'object' && error !== null && 'status' in error
}

/**
 *
 * @param error
 * @returns boolean
 */
export function isBusinessException(error: unknown): error is FetchBaseQueryError & {
    data: { errors: BusinessException[] }
} {
    return (
        isFetchBaseQueryError(error) &&
        error.status === HTTP_STATUS.UNPROCESSABLE_ENTITY &&
        typeof error.data === 'object' &&
        error.data !== null &&
        'errors' in error.data &&
        error.data.errors !== null &&
        typeof error.data.errors == 'object'
    )
}

/**
 * This error guard is used to check if the error payload has a message property
 * @param payload
 * @returns  boolean
 */
export function isPayloadErrorWithMessage(payload: unknown): payload is { data: { message: string } } {
    return (
        typeof payload === 'object' &&
        payload !== null &&
        'data' in payload &&
        typeof payload.data === 'object' &&
        payload.data !== null &&
        'message' in payload.data &&
        typeof payload.data.message === 'string'
    )
}
