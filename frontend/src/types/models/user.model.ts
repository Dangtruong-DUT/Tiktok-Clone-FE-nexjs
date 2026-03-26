import { Role, UserVerifyStatus } from '@/constants/enum'
import { z } from 'zod'

export const UserSchema = z
    .object({
        id: z.number(),
        uuid: z.string(),
        name: z.string(),
        email: z.string(),
        date_of_birth: z.string(),
        updated_at: z.string(),
        created_at: z.string(),
        verify: z.nativeEnum(UserVerifyStatus),
        bio: z.string(),
        location: z.string(),
        website: z.string(),
        username: z.string(),
        avatar: z.string(),
        following_count: z.number(),
        followers_count: z.number(),
        likes_count: z.number(),
        is_followed: z.boolean(),
        is_owner: z.boolean().optional(),
        role: z.nativeEnum(Role)
    })
    .strict()

export type UserType = z.infer<typeof UserSchema>
