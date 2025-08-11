export const API_ENDPOINT = {
    API_REFRESH_TOKEN: "/auth/refresh-token",
    API_LOGIN: "/auth/login",
    API_GOOGLE_LOGIN: "/auth/login/google",
    API_LOGOUT: "/auth/logout",
    API_REGISTER: "/auth/register",
    API_FORGOT_PASSWORD: "/auth/forgot-password",
    API_VERIFY_EMAIL: "/auth/verify-email",
    API_VERIFY_FORGOT_PASSWORD: "/auth/verify-forgot-password",
    API_RESET_PASSWORD: "/auth/reset-password",
} as const;
