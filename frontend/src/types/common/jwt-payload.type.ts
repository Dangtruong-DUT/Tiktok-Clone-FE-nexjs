import { Role, TokenType, UserVerifyStatus } from '@/constants/enum'
import { z } from 'zod'

export const JwtPayloadTypeSchema = z
    .object({
        sub: z.string(),
        user_id: z.string(),
        uuid: z.string(),
        role: z.union([z.literal(Role.USER), z.literal(Role.SUPER_ADMIN)]),
        token_type: z.union([
            z.literal(TokenType.ACCESS_TOKEN),
            z.literal(TokenType.REFRESH_TOKEN),
            z.literal(TokenType.FORGOT_PASSWORD_TOKEN),
            z.literal(TokenType.EMAIL_VERIFY_TOKEN)
        ]),
        verify: z.union([z.literal(UserVerifyStatus.UNVERIFIED), z.literal(UserVerifyStatus.VERIFIED)]),
        banned: z.boolean(),
        ban_remaining_days: z.number().optional(),
        ban_until: z.string().optional(),
        iat: z.number(),
        exp: z.number()
    })
    .strict()

export type JwtPayloadType = z.infer<typeof JwtPayloadTypeSchema>
