export const NEXT_API_ENDPOINT = {
    API_REFRESH_TOKEN: '/api/auth/refresh-token',
    API_LOGIN: '/api/auth/login',
    API_GOOGLE_LOGIN: '/api/auth/login/google',
    API_LOGOUT: '/api/auth/logout',
    API_REGISTER: '/api/auth/register',
    API_SET_TOKEN: '/api/auth/token',
    API_VERIFY_EMAIL: '/api/auth/verify-email'
} as const

export const BACKEND_API_ENDPOINT = {
    API_REFRESH_TOKEN: '/auth/refresh-token',
    API_LOGIN: '/auth/login',
    API_GOOGLE_LOGIN: '/auth/login/google',
    API_LOGOUT: '/auth/logout',
    API_REGISTER: '/auth/register',
    API_FORGOT_PASSWORD: '/auth/forgot-password',
    API_VERIFY_EMAIL: '/auth/verify-email',
    API_VERIFY_FORGOT_PASSWORD: '/auth/verify-forgot-password',
    API_RESET_PASSWORD: '/auth/reset-password',
    API_GET_ME: '/users/me'
} as const
