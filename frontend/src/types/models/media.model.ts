import { MediaType } from '@/constants/enum'
import { z } from 'zod'

export const MediaSchema = z
    .object({
        url: z.string(),
        type: z.nativeEnum(MediaType)
    })
    .strict()

export type Media = z.infer<typeof MediaSchema>
