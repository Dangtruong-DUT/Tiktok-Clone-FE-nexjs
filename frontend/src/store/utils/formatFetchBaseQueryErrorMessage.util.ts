import { HTTP_STATUS } from '@/constants/api/http-status'
import { isPayloadErrorWithMessage } from '@/utils/errors/api-error-guards.util'
import { LocalesType } from '@/i18n/config'
import { FetchBaseQueryError } from '@reduxjs/toolkit/query'

import enError from '../../../messages/en/error.json'
import viError from '../../../messages/vi/error.json'

export interface ReadableErrorMessageReturn {
    title: string
    description: string
}

export function formatFetchBaseQueryErrorMessage(
    error: FetchBaseQueryError,
    lang: LocalesType
): ReadableErrorMessageReturn {
    const m = lang === 'vi' ? viError.api : enError.api

    const silentStatuses = [HTTP_STATUS.UNPROCESSABLE_ENTITY, HTTP_STATUS.TOO_MANY_REQUESTS]
    if (typeof error.status === 'string' || (silentStatuses as readonly number[]).includes(error.status)) {
        return { title: m.unknownTitle, description: m.unknownDescription }
    }

    // Backend message takes priority — already translated via X-Locale header
    if (isPayloadErrorWithMessage(error)) {
        return { title: m.errorOccurredTitle, description: error.data.message }
    }

    if (error.status >= 500) {
        return { title: m.serverErrorTitle, description: m.serverErrorDescription }
    }

    if (error.status === HTTP_STATUS.NOT_FOUND) {
        return { title: m.notFoundTitle, description: m.notFoundDescription }
    }

    if (error.status === HTTP_STATUS.BAD_REQUEST) {
        return { title: m.badRequestTitle, description: m.badRequestDescription }
    }

    return { title: m.unknownTitle, description: m.unknownDescription }
}
