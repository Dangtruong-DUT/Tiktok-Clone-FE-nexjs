import httpClient from '@/apis/client'
import { BACKEND_API_ENDPOINT } from '@/constants/api/endpoints'
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
    login: (body: LoginReqBodyType) => httpClient.post<BackendAuthTokensResponse>(BACKEND_API_ENDPOINT.AUTH.LOGIN, body),
    register: (body: RegisterReqBodyType) =>
        httpClient.post<BackendAuthTokensResponse>(BACKEND_API_ENDPOINT.AUTH.REGISTER, body),
    logout: (data: LogoutReqBodyType & { access_token: string }) => {
        const { access_token, ...body } = data
        return httpClient.post<LogoutResType>(BACKEND_API_ENDPOINT.AUTH.LOGOUT, body, {
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        })
    },
    forgotPassword: (body: ForgotPasswordReqBodyType) =>
        httpClient.post<{ message: string }>(BACKEND_API_ENDPOINT.AUTH.FORGOT_PASSWORD, body),
    verifyForgotPassword: (body: verifyForgotPasswordReqBodyType) =>
        httpClient.post<{ message: string }>(BACKEND_API_ENDPOINT.AUTH.VERIFY_FORGOT_PASSWORD, body),
    resetPassword: (body: ResetPasswordReqBodyType) =>
        httpClient.post<{ message: string }>(BACKEND_API_ENDPOINT.AUTH.RESET_PASSWORD, body),
    refreshToken: (body: RefreshTokenReqBodyType) =>
        httpClient.post<BackendAuthTokensResponse>(BACKEND_API_ENDPOINT.AUTH.REFRESH_TOKEN, body),
    verifyEmail: (body: VerifyEmailReqBodyType) =>
        httpClient.post<BackendAuthTokensResponse>(BACKEND_API_ENDPOINT.AUTH.VERIFY_EMAIL, body)
}

export default AuthRequestApi
