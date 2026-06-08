import { HTTP_STATUS } from '@/constants/api/http-status'
import { isPayloadErrorWithMessage } from '@/utils/errors/api-error-guards.util'
import { FetchBaseQueryError } from '@reduxjs/toolkit/query'

export interface ReadableErrorMessageReturn {
    title: string
    description: string
}
export function formatFetchBaseQueryErrorMessage(error: FetchBaseQueryError): ReadableErrorMessageReturn {
    const silentStatuses = [HTTP_STATUS.UNPROCESSABLE_ENTITY, HTTP_STATUS.TOO_MANY_REQUESTS]
    if (typeof error.status === 'string' || (silentStatuses as readonly number[]).includes(error.status)) {
        return {
            title: 'Unknown Error',
            description: 'An unknown error occurred'
        }
    }

    if (error.status >= 500) {
        return {
            title: 'Server Error',
            description: 'Please try again later.'
        }
    }

    if (error.status === HTTP_STATUS.NOT_FOUND) {
        return {
            title: 'Not Found',
            description: 'The requested resource was not found.'
        }
    }

    if (error.status === HTTP_STATUS.BAD_REQUEST) {
        return {
            title: 'Bad Request',
            description: 'The request was invalid. Please check your input and try again.'
        }
    }

    if (isPayloadErrorWithMessage(error)) {
        return {
            title: 'Error Occurred',
            description: error.data.message
        }
    }

    return {
        title: 'Unknown Error',
        description: 'An unknown error occurred'
    }
}
