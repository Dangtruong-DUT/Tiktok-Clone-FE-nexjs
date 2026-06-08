export const AuthMode = {
    LOGIN: 'login',
    SIGNUP: 'signup',
    LOGIN_EMAIL: 'login-email',
    SIGNUP_EMAIL: 'signup-email'
} as const

export type AuthModeType = (typeof AuthMode)[keyof typeof AuthMode]

export const EMAIL_AUTH_MODES = [AuthMode.LOGIN_EMAIL, AuthMode.SIGNUP_EMAIL] as const
export const LOGIN_MODES = [AuthMode.LOGIN, AuthMode.LOGIN_EMAIL] as const
