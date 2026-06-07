import type { ApiSuccessResponseWithData, ApiSuccessResponseWithMeta } from '@/types/common/http-response.type'

export interface AiDocumentAdminDto {
    readonly id: number
    readonly uuid: string
    readonly title: string
    readonly source_type: 'faq' | 'guide' | 'policy' | 'feature' | 'other'
    readonly content_type: string
    readonly language: string
    readonly chunk_count: number
    readonly is_indexed: boolean
    readonly indexed_at: string | null
    readonly created_at: string
    readonly file_url: string | null
}

export interface AiDocumentDetailAdminDto extends AiDocumentAdminDto {
    readonly raw_content: string
}

export type ListAiDocumentsResDto = ApiSuccessResponseWithMeta<AiDocumentAdminDto[]>
export type UploadAiDocumentResDto = ApiSuccessResponseWithData<AiDocumentAdminDto>
export type GetAiDocumentResDto = ApiSuccessResponseWithData<AiDocumentDetailAdminDto>
