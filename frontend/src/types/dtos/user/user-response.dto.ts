import { HttpResponseWithData, HttpResponseWithMeta } from '@/types/common/http-response.type'
import { PaginationMeta } from '@/types/common/pagination-meta.type'
import { UserAuthType } from '@/types/dtos/auth/auth-response.dto'
import { UserSettingsType } from '@/types/models/user-settings.model'
import { UserType } from '@/types/models/user.model'

export type VerifyEmailResType = HttpResponseWithData<{
    access_token: string
    refresh_token: string
    user: UserAuthType
}>

export type GetUserProfileResType = HttpResponseWithData<UserType>

export type UpdateUserResType = HttpResponseWithData<UserType>
export type GetUserSettingsResType = HttpResponseWithData<UserSettingsType>
export type UpdateUserSettingsResType = HttpResponseWithData<UserSettingsType>

export type MetaPagination = PaginationMeta

export type GetListUserResType = HttpResponseWithMeta<UserType[], MetaPagination>
