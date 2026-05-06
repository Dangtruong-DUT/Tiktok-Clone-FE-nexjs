import { Role, TokenType, UserVerifyStatus } from '@/constants/enum'
import { z } from 'zod'

export const JwtPayloadTypeSchema = z
    .object({
        sub: z.string(),
        user_id: z.string(),
        uuid: z.string(),
        role: z.nativeEnum(Role),
        token_type: z.nativeEnum(TokenType),
        verify: z.nativeEnum(UserVerifyStatus),
        banned: z.boolean().optional(),
        ban_remaining_days: z.number().optional(),
        banned_until: z.string().optional(),
        ban_until: z.string().optional(),
        ban_expires_at: z.string().optional(),
        locked_until: z.string().optional(),
        iat: z.number(),
        exp: z.number()
    })
    .strict()

export type JwtPayloadType = z.infer<typeof JwtPayloadTypeSchema>
