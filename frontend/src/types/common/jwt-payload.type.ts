import { Role } from '@/constants/enum'
import { z } from 'zod'

export const JwtPayloadTypeSchema = z
    .object({
        sub: z.string(),
        user_id: z.string(),
        username: z.string(),
        role: z.nativeEnum(Role),
        iat: z.number(),
        exp: z.number()
    })
    .strict()

export type JwtPayloadType = z.infer<typeof JwtPayloadTypeSchema>
