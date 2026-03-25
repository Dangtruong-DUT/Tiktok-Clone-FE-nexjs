import { ResType } from '@/types/response/response.type'
import { UserType } from '@/types/schemas/User.schema'
import { UserAuthType } from './auth.type'

export type VerifyEmailResType = ResType<
    {
        access_token: string
        refresh_token: string
        user: UserAuthType
    },
    void
>

export type GetUserProfileResType = ResType<UserType, void>

export type UpdateUserResType = ResType<UserType, void>

export type MetaPagination = {
    type: 'offset' | 'simple' | 'cursor'
    current_page: number
    last_page: number
    per_page: number
    total?: number
    next_page_url?: string | null
    prev_page_url?: string | null
}

export type GetListUserResType = ResType<UserType[], MetaPagination>
