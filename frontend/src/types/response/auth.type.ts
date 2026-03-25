import { ResType } from '@/types/response/response.type'
import { UserType } from '../schemas/User.schema'

export type UserAuthType = Pick<
    UserType,
    'id' | 'uuid' | 'name' | 'email' | 'verify' | 'username' | 'avatar' | 'role' | 'updated_at'
>

export type LoginResponseType = ResType<
    {
        access_token: string
        refresh_token: string
        user: UserAuthType
    },
    void
>

export type RegisterResponseType = ResType<
    {
        access_token: string
        refresh_token: string
        user: UserAuthType
    },
    void
>

export type LogoutResType = { message: string }

export type RefreshTokenRes = ResType<
    {
        access_token: string
        refresh_token: string
        user: UserAuthType
    },
    void
>
