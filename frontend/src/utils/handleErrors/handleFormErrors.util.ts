import { isEntityError } from '@/store/utils/apiErrorGuards'
import { FieldValues, Path, UseFormSetError } from 'react-hook-form'

/** This function is used to handle form errors from the API response and set the form errors using react-hook-form's setError function
 * @param error The error object returned from the API response
 * @param setFormError The setError function from react-hook-form to set the form errors
 */
export function handleFormError<TFieldValues extends FieldValues>({
    error,
    setFormError
}: {
    error: unknown
    setFormError: UseFormSetError<TFieldValues>
}) {
    if (isEntityError(error)) {
        const errors = error.data.errors

        Object.entries(errors).forEach(([field, messages]) => {
            setFormError(field as Path<TFieldValues>, {
                type: 'manual',
                message: Array.isArray(messages) ? messages[0] : String(messages)
            })
        })
    }
}
