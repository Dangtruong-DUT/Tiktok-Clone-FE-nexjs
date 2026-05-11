import { EncodingStatus } from '@/constants/enum'

export type VideoStatusType = {
    readonly id: string
    readonly name: string
    readonly status: EncodingStatus
    readonly message: string
    readonly created_at: Date
    readonly updated_at: Date
}
