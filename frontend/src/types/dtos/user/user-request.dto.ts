import { PrivacyVisibility } from '@/constants/enum'
import z from 'zod'

export const VerifyEmailReqBody = z.object({
    email_verify_token: z.string().min(10)
})

export type VerifyEmailReqBodyType = z.infer<typeof VerifyEmailReqBody>

export const followUserReqBody = z.object({
    user_uuid: z.string().min(10)
})

export type FollowUserReqBodyType = z.infer<typeof followUserReqBody>

export const ChangePasswordBody = z
    .object({
        current_password: z.string().min(6).max(100),
        password: z.string().min(6).max(100),
        confirm_password: z.string().min(6).max(100)
    })
    .strict()
    .superRefine(({ confirm_password, password }, ctx) => {
        if (confirm_password !== password) {
            ctx.addIssue({
                code: 'custom',
                message: 'Mật khẩu mới không khớp',
                path: ['confirm_password']
            })
        }
    })

export type ChangePasswordBodyType = z.TypeOf<typeof ChangePasswordBody>

export const UpdateUserBody = z.object({
    name: z.string().min(2).max(100).optional(),
    date_of_birth: z.string().min(10).max(10).optional(),
    bio: z.string().max(300).optional(),
    location: z.string().max(100).optional(),
    website: z.string().max(100).optional(),
    username: z
        .string()
        .regex(/^(?!.*\.\.)(?!.*__)[a-zA-Z0-9._]{3,20}$/)
        .optional(),
    avatar_file_id: z.number().int().positive().optional()
})

export type UpdateUserBodyType = z.TypeOf<typeof UpdateUserBody>

export const GetUserIndicatorQueryParams = z.object({
    fromDate: z.string().min(10).max(30),
    toDate: z.string().min(10).max(30)
})

export type GetUserIndicatorQueryParamsType = z.TypeOf<typeof GetUserIndicatorQueryParams>

export type GetUserListPagingQueryType = {
    user_uuid: string
    page?: number
    per_page?: number
    q?: string
}

export type GetSuggestedUsersQueryType = {
    page?: number
    per_page?: number
    q?: string
}

export const UpdateUserSettingsBody = z
    .object({
        liked_videos_visibility: z.nativeEnum(PrivacyVisibility).optional(),
        bookmarked_videos_visibility: z.nativeEnum(PrivacyVisibility).optional(),
        followers_visibility: z.nativeEnum(PrivacyVisibility).optional(),
        following_visibility: z.nativeEnum(PrivacyVisibility).optional()
    })
    .strict()

export type UpdateUserSettingsBodyType = z.TypeOf<typeof UpdateUserSettingsBody>
