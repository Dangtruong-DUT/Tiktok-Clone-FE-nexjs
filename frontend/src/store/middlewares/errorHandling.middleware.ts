import { Middleware, isRejectedWithValue } from '@reduxjs/toolkit'
import { toast } from 'sonner'
import { formatFetchBaseQueryErrorMessage } from '@/store/utils/formatFetchBaseQueryErrorMessage.util'
import { isBusinessException, isFetchBaseQueryError } from '../utils/apiErrorGuards.util'

export const errorHandleMiddleware: Middleware = () => (next) => (action) => {
    if (!isRejectedWithValue(action)) return next(action)

    if (!isFetchBaseQueryError(action.payload)) return next(action)

    if (isBusinessException(action.payload)) return next(action)

    const toastMessage = formatFetchBaseQueryErrorMessage(action.payload)
    toast.error(toastMessage.title, {
        description: toastMessage.description,
        duration: 5000
    })

    return next(action)
}
