/**
 * Handles API errors that occur on the Next.js server
 * @param error The error object thrown by the API call
 * @throws The original error if it is a Next.js redirect error, otherwise it will be handled by the caller
 */
export function handleErrorApiOnNextServer(error: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any).digest?.includes('NEXT_REDIRECT')) throw error
}

type WrapperServerCallApiProps<T> = {
    apiCallFn: () => Promise<T>
    onError?: (error: unknown) => void
    onSuccess?: (data: T) => void
}
/**
 * A wrapper function to handle API calls on the Next.js server with error handling
 * @param apiCallFn The API call function that returns a promise
 * @param onError Optional callback function to handle errors
 * @param onSuccess Optional callback function to handle successful response
 * @returns The result of the API call or null if an error occurred
 * @throws The original error if it is a Next.js redirect error, otherwise it will be handled by the caller
 * This function is useful for handling API calls in Next.js server components where we want to catch and handle errors gracefully without crashing the server, while still allowing Next.js redirect errors to propagate correctly.
 */
export const WrapperServerCallApi = async <T>({
    apiCallFn,
    onError,
    onSuccess
}: WrapperServerCallApiProps<T>): Promise<null | T> => {
    let result: null | T = null
    try {
        result = await apiCallFn()
        onSuccess?.(result)
    } catch (error) {
        handleErrorApiOnNextServer(error)
        onError?.(error)
    }
    return result
}
