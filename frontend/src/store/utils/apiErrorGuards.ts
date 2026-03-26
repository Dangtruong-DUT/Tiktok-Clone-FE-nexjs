import { HTTP_STATUS } from '@/constants/http'
import { EntityError } from '@/types/common/http-response.type'
import { FetchBaseQueryError } from '@reduxjs/toolkit/query'

export function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
    return typeof error === 'object' && error !== null && 'status' in error
}

export function isEntityError(error: unknown): error is FetchBaseQueryError & {
    data: { errors: EntityError[] }
} {
    return (
        isFetchBaseQueryError(error) &&
        error.status === HTTP_STATUS.UNPROCESSABLE_ENTITY &&
        typeof error.data === 'object' &&
        error.data !== null &&
        'errors' in error.data &&
        error.data.errors !== null &&
        typeof error.data.errors == 'object' &&
        Array.isArray(error.data.errors)
    )
}

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

export function isActionHttpErrorWithMessage(
    action: unknown
): action is { payload: { data: { message: string }; status: number } } {
    return (
        typeof action === 'object' &&
        action !== null &&
        'payload' in action &&
        typeof action.payload === 'object' &&
        action.payload !== null &&
        'data' in action.payload &&
        'status' in action.payload &&
        isPayloadErrorWithMessage(action.payload)
    )
}

export function isActionHttpErrorWithDetail(
    action: unknown
): action is { payload: { data: { title: string; detail: string }; status: number } } {
    return (
        typeof action === 'object' &&
        action !== null &&
        'payload' in action &&
        typeof action.payload === 'object' &&
        action.payload !== null &&
        'data' in action.payload &&
        'status' in action.payload &&
        isPayloadErrorWithDetail(action.payload)
    )
}

export function isPayloadErrorWithDetail(payload: unknown): payload is { data: { title: string; detail: string } } {
    return (
        typeof payload === 'object' &&
        payload !== null &&
        'data' in payload &&
        typeof payload.data === 'object' &&
        payload.data !== null &&
        'title' in payload.data &&
        typeof payload.data.title === 'string' &&
        'detail' in payload.data &&
        typeof payload.data.detail === 'string'
    )
}