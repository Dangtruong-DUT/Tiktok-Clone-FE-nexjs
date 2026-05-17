import { HttpResponseWithData } from '@/types/common/http-response.type'
import { ApiSuccessResponse } from '@/types/common/http-response.type'
import { UserType } from '@/types/models/user.model'

export type UserAuthType = Pick<
    UserType,
    'id' | 'uuid' | 'name' | 'email' | 'verify' | 'username' | 'avatar' | 'role' | 'updated_at' | 'bio'
>

export type AuthTokensResponse = HttpResponseWithData<{
    readonly access_token: string
    readonly refresh_token: string
    readonly user: UserAuthType
}>

export type LoginResponseType = AuthTokensResponse
export type RegisterResponseType = AuthTokensResponse
export type RefreshTokenRes = AuthTokensResponse

export type LogoutResType = ApiSuccessResponse
