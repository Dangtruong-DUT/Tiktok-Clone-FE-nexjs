import { MediaType } from '@/constants/enum'

export type Media = {
    readonly url: string
    readonly type: MediaType
}

/** @deprecated use Media */
export type MediaSchema = Media
