import { HttpResponseWithData } from '@/types/common/http-response.type'
import { ApiSuccessResponse } from '@/types/common/http-response.type'
import { UserType } from '@/types/models/user.model'

export type UserAuthType = Pick<
    UserType,
    'id' | 'uuid' | 'name' | 'email' | 'verify' | 'username' | 'avatar' | 'role' | 'updated_at' | 'bio'
>

/**
 * What the Laravel backend returns for auth endpoints.
 * Contains tokens — used ONLY in server-side BFF route handlers.
 * Never send this shape to the browser.
 */
export type BackendAuthTokensResponse = HttpResponseWithData<{
    readonly access_token: string
    readonly refresh_token: string
    readonly user: UserAuthType
}>

/**
 * What the Next.js BFF returns to the browser after auth actions.
 * Tokens are stripped and stored as httpOnly cookies — only user data crosses the wire.
 */
export type BffAuthUserResponse = HttpResponseWithData<{
    readonly user: UserAuthType
}>

// Named aliases used by client-side RTK Query services and action guards
export type LoginResponseType = BffAuthUserResponse
export type RegisterResponseType = BffAuthUserResponse
export type RefreshTokenRes = BffAuthUserResponse

export type LogoutResType = ApiSuccessResponse