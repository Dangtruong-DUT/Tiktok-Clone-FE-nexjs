import { MediaType } from '@/constants/enum'

export interface Media {
    readonly id: number
    readonly url: string
    readonly type: MediaType
    readonly upload_file_uuid: string | null
}
