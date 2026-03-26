import { Role, TokenType, UserVerifyStatus } from '@/constants/enum'
import { verify } from 'crypto'
import { uuid, z } from 'zod'

export const JwtPayloadTypeSchema = z
    .object({
        sub: z.string(),
        user_id: z.string(),
        uuid: z.string(),
        role: z.nativeEnum(Role),
        token_Type: z.nativeEnum(TokenType),
        verify:z.nativeEnum(UserVerifyStatus),
        iat: z.number(),
        exp: z.number()
    })
    .strict()

export type JwtPayloadType = z.infer<typeof JwtPayloadTypeSchema>