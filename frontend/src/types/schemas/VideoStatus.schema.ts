import { EncodingStatus } from '@/constants/enum'

export interface VideoStatusType {
    id: string
    name: string
    status: EncodingStatus
    message: string
    created_at: Date
    updated_at: Date
}
