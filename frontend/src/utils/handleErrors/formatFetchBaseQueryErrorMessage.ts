import { HTTP_STATUS } from '@/constants/http'
import { isPayloadErrorWithDetail, isPayloadErrorWithMessage } from '@/store/utils/apiErrorGuards'
import { FetchBaseQueryError } from '@reduxjs/toolkit/query'

export interface ReadableErrorMessageReturn {
    title: string
    description: string
}
export function formatFetchBaseQueryErrorMessage(error: FetchBaseQueryError): ReadableErrorMessageReturn {
    const silentStatuses = [HTTP_STATUS.UNPROCESSABLE_ENTITY, HTTP_STATUS.TOO_MANY_REQUESTS]
    if (typeof error.status === 'string' || silentStatuses.includes(error.status)) {
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

    if (isPayloadErrorWithMessage(error)) {
        return {
            title: 'Error Occurred',
            description: error.data.message
        }
    }

    if (isPayloadErrorWithDetail(error)) {
        return {
            title: error.data.title,
            description: error.data.detail
        }
    }

    return {
        title: 'Unknown Error',
        description: 'An unknown error occurred'
    }
}