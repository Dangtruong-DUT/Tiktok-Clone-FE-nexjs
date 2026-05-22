import { HttpResponseWithData, HttpResponseWithMeta } from '@/types/common/http-response.type'
import { PaginationMeta } from '@/types/common/pagination-meta.type'
import { UserAuthType } from '@/types/dtos/auth/auth-response.dto'
import { UserSettingsType } from '@/types/models/user-settings.model'
import { UserType } from '@/types/models/user.model'

/** BFF shape — tokens stripped, only user data returned to the browser. */
export type VerifyEmailResType = HttpResponseWithData<{
    user: UserAuthType
}>

export type GetUserProfileResType = HttpResponseWithData<UserType>

export type UpdateUserResType = HttpResponseWithData<UserType>
export type GetUserSettingsResType = HttpResponseWithData<UserSettingsType>
export type UpdateUserSettingsResType = HttpResponseWithData<UserSettingsType>

export type GetListUserResType = HttpResponseWithMeta<UserType[], PaginationMeta>
