import { PrivacyVisibility } from '@/constants/enum'
import { z } from 'zod'

export const UserSettingsSchema = z
    .object({
        id: z.number(),
        liked_videos_visibility: z.nativeEnum(PrivacyVisibility),
        bookmarked_videos_visibility: z.nativeEnum(PrivacyVisibility),
        followers_visibility: z.nativeEnum(PrivacyVisibility),
        following_visibility: z.nativeEnum(PrivacyVisibility),
        updated_at: z.string(),
        created_at: z.string()
    })
    .strict()

export type UserSettingsType = z.infer<typeof UserSettingsSchema>
