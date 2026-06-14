import { Middleware, isRejectedWithValue } from '@reduxjs/toolkit'
import { toast } from 'sonner'
import { formatFetchBaseQueryErrorMessage } from '@/store/utils/formatFetchBaseQueryErrorMessage.util'
import { isBusinessException, isFetchBaseQueryError } from '../../utils/errors/api-error-guards.util'
import { HTTP_STATUS } from '@/constants/api/http-status'
import type { storeApiType } from '@/store'

const silentStatuses = [HTTP_STATUS.UNPROCESSABLE_ENTITY, HTTP_STATUS.TOO_MANY_REQUESTS, HTTP_STATUS.FORBIDDEN]

export const errorHandleMiddleware: Middleware = (storeAPI: storeApiType) => (next) => (action) => {
    if (!isRejectedWithValue(action)) return next(action)

    if (!isFetchBaseQueryError(action.payload)) return next(action)

    if (isBusinessException(action.payload)) return next(action)

    if (
        typeof action.payload.status === 'string' ||
        (silentStatuses as readonly number[]).includes(action.payload.status) ||
        action.payload.status > 500
    )
        return next(action)

    const { lang } = storeAPI.getState().app
    const toastMessage = formatFetchBaseQueryErrorMessage(action.payload, lang)
    toast.error(toastMessage.title, {
        description: toastMessage.description,
        duration: 5000
    })

    return next(action)
}
