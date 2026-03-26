import { Middleware, isRejectedWithValue } from '@reduxjs/toolkit'
import { toast } from 'sonner'
import { formatFetchBaseQueryErrorMessage } from '@/utils/handleErrors/formatFetchBaseQueryErrorMessage'
import { Info } from 'lucide-react'
import { isEntityError } from '../utils/apiErrorGuards'
import { isFetchBaseQueryError } from '@/helper/checkType'

export const errorHandleMiddleware: Middleware = () => (next) => (action) => {
    if (!isRejectedWithValue(action)) return next(action)

    if (!isFetchBaseQueryError(action.payload)) return next(action)

    if (isEntityError(action.payload)) return next(action)

    const toastMessage = formatFetchBaseQueryErrorMessage(action.payload)
    toast(toastMessage.title, {
        description: toastMessage.description,
        duration: 5000,
        icon: <Info />
    })

    return next(action)
}