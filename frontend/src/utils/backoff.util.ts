/**
 * This utility file contains functions related to implementing an exponential backoff strategy for retrying failed API requests.
 * It includes a sleep function to introduce delays and a function to calculate the delay for the next retry attempt based on the number of attempts made.
 */
export const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * This function calculates the delay
 * for the next retry attempt using exponential backoff strategy.
 *
 * @param attempt
 * @param baseDelay
 * @param maxDelay
 * @returns The calculated delay in milliseconds for the next retry attempt.
 */
export const getExponentialBackoffDelay = (attempt: number, baseDelay = 1000, maxDelay = 10000): number => {
    const exponentialDelay = baseDelay * Math.pow(2, attempt)

    const jitter = Math.random() * 300

    return Math.min(exponentialDelay + jitter, maxDelay)
}
