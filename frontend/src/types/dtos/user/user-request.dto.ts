import { PrivacyVisibility } from '@/constants/enum'
import { USERNAME_VALIDATION_REGEX } from '@/constants/regex'
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

export type ChangePasswordBodyType = z.infer<typeof ChangePasswordBody>

export const UpdateUserBody = z.object({
    name: z.string().min(2).max(100).optional(),
    date_of_birth: z.string().min(10).max(10).optional(),
    bio: z.string().max(300).optional(),
    location: z.string().max(100).optional(),
    website: z.string().max(100).optional(),
    username: z.string().regex(USERNAME_VALIDATION_REGEX).optional(),
    avatar_file_id: z.number().int().positive().optional()
})

export type UpdateUserBodyType = z.infer<typeof UpdateUserBody>

export const GetUserIndicatorQueryParams = z.object({
    fromDate: z.string().min(10).max(30),
    toDate: z.string().min(10).max(30)
})

export type GetUserIndicatorQueryParamsType = z.infer<typeof GetUserIndicatorQueryParams>

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

const privacyVisibilitySchema = z.union([z.literal(PrivacyVisibility.PUBLIC), z.literal(PrivacyVisibility.PRIVATE)])

export const UpdateUserSettingsBody = z
    .object({
        liked_videos_visibility: privacyVisibilitySchema.optional(),
        bookmarked_videos_visibility: privacyVisibilitySchema.optional(),
        followers_visibility: privacyVisibilitySchema.optional(),
        following_visibility: privacyVisibilitySchema.optional()
    })
    .strict()

export type UpdateUserSettingsBodyType = z.infer<typeof UpdateUserSettingsBody>
