import { isPayloadErrorWithMessage } from './apiErrorGuards.util'

/**
 * Extracts a user-friendly error message from an API error object.
 * @param error - The error object to extract the message from.
 * @returns The extracted error message, or undefined if it cannot be extracted.
 */
export function extractApiErrorMessage(error: unknown): string | undefined {
    if (isPayloadErrorWithMessage(error)) return error.data.message
    return undefined
}
