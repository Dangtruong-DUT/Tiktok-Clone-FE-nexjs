import { HttpResponseWithData } from '@/types/common/http-response.type'
import { UserType } from '@/types/models/user.model'

export type UserAuthType = Pick<
    UserType,
    'id' | 'uuid' | 'name' | 'email' | 'verify' | 'username' | 'avatar' | 'role' | 'updated_at' | 'bio'
>

export type LoginResponseType = HttpResponseWithData<{
    access_token: string
    refresh_token: string
    user: UserAuthType
}>

export type RegisterResponseType = HttpResponseWithData<{
    access_token: string
    refresh_token: string
    user: UserAuthType
}>

export type LogoutResType = { message: string }

export type RefreshTokenRes = HttpResponseWithData<{
    access_token: string
    refresh_token: string
    user: UserAuthType
}>
