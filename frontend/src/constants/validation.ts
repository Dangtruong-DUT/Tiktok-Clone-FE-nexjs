export const VALIDATION_MESSAGES = {
    passwordsDoNotMatch: 'Passwords do not match',
    durationMustBeAtLeastOneDay: 'Duration must be at least 1 day',
    customReasonRequired: 'Custom reason is required'
} as const

export type ValidationMessageKey = keyof typeof VALIDATION_MESSAGES
