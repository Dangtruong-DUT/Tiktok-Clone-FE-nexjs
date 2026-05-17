import { z } from 'zod'

export const GetAdminUsersParamsSchema = z
    .object({
        page: z.number().int().positive().optional(),
        per_page: z.number().int().positive().optional(),
        q: z.string().optional(),
        status: z.enum(['active', 'banned', 'deleted', 'all']).optional(),
        order_by: z
            .array(z.enum(['id', 'username', 'email', 'created_at', '-id', '-username', '-email', '-created_at']))
            .optional()
    })
    .strict()

export const BanUserReqSchema = z
    .object({
        user_uuid: z.string(),
        reason: z.string(),
        duration_days: z.number().int().positive().optional()
    })
    .strict()

export const UnbanUserReqSchema = z
    .object({
        user_uuid: z.string()
    })
    .strict()

export const DeleteUserReqSchema = z
    .object({
        user_uuid: z.string(),
        reason: z.string()
    })
    .strict()

export const RestoreUserReqSchema = z
    .object({
        user_uuid: z.string()
    })
    .strict()

export const ResetUserPasswordReqSchema = z
    .object({
        user_uuid: z.string(),
        password: z.string().min(8).max(100),
        confirm_password: z.string().min(8).max(100)
    })
    .strict()

export const SendUserMailReqSchema = z
    .object({
        user_uuid: z.string(),
        subject: z.string().min(3).max(150),
        message: z.string().min(10).max(5000)
    })
    .strict()

export type GetAdminUsersParams = z.infer<typeof GetAdminUsersParamsSchema>
export type BanUserReq = z.infer<typeof BanUserReqSchema>
export type UnbanUserReq = z.infer<typeof UnbanUserReqSchema>
export type DeleteUserReq = z.infer<typeof DeleteUserReqSchema>
export type RestoreUserReq = z.infer<typeof RestoreUserReqSchema>
export type ResetUserPasswordReq = z.infer<typeof ResetUserPasswordReqSchema>
export type SendUserMailReq = z.infer<typeof SendUserMailReqSchema>

export const DeleteUserFormSchema = z.object({
    reason: z.string().min(10)
})

export const BanUserFormSchema = z.object({
    reason: z.string().min(10),
    durationDays: z
        .string()
        .optional()
        .refine((v) => !v || (!isNaN(Number(v)) && Number(v) >= 1), {
            message: 'Duration must be at least 1 day'
        })
})

export const ResetPasswordFormSchema = z
    .object({
        password: z.string().min(8).max(100),
        confirmPassword: z.string()
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword']
    })

export const SendMailFormSchema = z.object({
    subject: z.string().min(3).max(150),
    message: z.string().min(10).max(5000)
})

export type DeleteUserFormValues = z.infer<typeof DeleteUserFormSchema>
export type BanUserFormValues = z.infer<typeof BanUserFormSchema>
export type ResetPasswordFormValues = z.infer<typeof ResetPasswordFormSchema>
export type SendMailFormValues = z.infer<typeof SendMailFormSchema>
