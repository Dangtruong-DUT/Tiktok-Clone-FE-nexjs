import { EncodingStatus } from '@/constants/enum'
import { z } from 'zod'

export const VideoStatusSchema = z
    .object({
        id: z.string(),
        name: z.string(),
        status: z.nativeEnum(EncodingStatus),
        message: z.string(),
        created_at: z.coerce.date(),
        updated_at: z.coerce.date()
    })
    .strict()

export type VideoStatusType = z.infer<typeof VideoStatusSchema>
