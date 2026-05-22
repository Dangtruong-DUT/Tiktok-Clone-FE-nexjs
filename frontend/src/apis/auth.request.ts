import httpClient from '@/apis/client'
import { BACKEND_API_ENDPOINT } from '@/config/endpoint.config'
import { BackendAuthTokensResponse, LogoutResType } from '@/types/dtos/auth/auth-response.dto'
import {
    ForgotPasswordReqBodyType,
    LoginReqBodyType,
    LogoutReqBodyType,
    RefreshTokenReqBodyType,
    RegisterReqBodyType,
    ResetPasswordReqBodyType,
    verifyForgotPasswordReqBodyType
} from '@/types/dtos/auth/auth-request.dto'
import { VerifyEmailReqBodyType } from '@/types/dtos/user/user-request.dto'

const AuthRequestApi = {
    login: (body: LoginReqBodyType) =>
        httpClient.post<BackendAuthTokensResponse>(BACKEND_API_ENDPOINT.API_LOGIN, body),
    register: (body: RegisterReqBodyType) =>
        httpClient.post<BackendAuthTokensResponse>(BACKEND_API_ENDPOINT.API_REGISTER, body),
    logout: (data: LogoutReqBodyType & { access_token: string }) => {
        const { access_token, ...body } = data
        return httpClient.post<LogoutResType>(BACKEND_API_ENDPOINT.API_LOGOUT, body, {
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        })
    },
    forgotPassword: (body: ForgotPasswordReqBodyType) =>
        httpClient.post<{ message: string }>(BACKEND_API_ENDPOINT.API_FORGOT_PASSWORD, body),
    verifyForgotPassword: (body: verifyForgotPasswordReqBodyType) =>
        httpClient.post<{ message: string }>(BACKEND_API_ENDPOINT.API_VERIFY_FORGOT_PASSWORD, body),
    resetPassword: (body: ResetPasswordReqBodyType) =>
        httpClient.post<{ message: string }>(BACKEND_API_ENDPOINT.API_RESET_PASSWORD, body),
    refreshToken: (body: RefreshTokenReqBodyType) =>
        httpClient.post<BackendAuthTokensResponse>(BACKEND_API_ENDPOINT.API_REFRESH_TOKEN, body),
    verifyEmail: (body: VerifyEmailReqBodyType) =>
        httpClient.post<BackendAuthTokensResponse>(BACKEND_API_ENDPOINT.API_VERIFY_EMAIL, body)
}

export default AuthRequestApi
