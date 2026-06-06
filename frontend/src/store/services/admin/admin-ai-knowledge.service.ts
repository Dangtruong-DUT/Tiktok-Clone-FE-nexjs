import { createApi } from '@reduxjs/toolkit/query/react'
import baseQueryWithReauth from '@/store/services/client'
import { BACKEND_API_ENDPOINT } from '@/constants/api/endpoints'

export interface AiDocument {
    id: number
    uuid: string
    title: string
    source_type: 'faq' | 'guide' | 'policy' | 'feature' | 'other'
    content_type: string
    language: string
    chunk_count: number
    is_indexed: boolean
    indexed_at: string | null
    created_at: string
}

interface PaginatedDocuments {
    data: AiDocument[]
    current_page: number
    last_page: number
    total: number
    per_page: number
}

interface UploadDocumentPayload {
    formData: FormData
}

export const AdminAiKnowledgeApi = createApi({
    reducerPath:       'adminAiKnowledgeApi',
    baseQuery:         baseQueryWithReauth,
    tagTypes:          ['AiDocument'],
    keepUnusedDataFor: 60,
    endpoints: (builder) => ({
        getDocuments: builder.query<{ data: PaginatedDocuments }, { page?: number; perPage?: number }>({
            query: ({ page = 1, perPage = 20 } = {}) =>
                `${BACKEND_API_ENDPOINT.ADMIN.AI_KNOWLEDGE.DOCUMENTS}?page=${page}&per_page=${perPage}`,
            providesTags: ['AiDocument'],
        }),

        uploadDocument: builder.mutation<{ data: AiDocument }, UploadDocumentPayload>({
            query: ({ formData }) => ({
                url:    BACKEND_API_ENDPOINT.ADMIN.AI_KNOWLEDGE.UPLOAD,
                method: 'POST',
                body:   formData,
            }),
            invalidatesTags: ['AiDocument'],
        }),

        deleteDocument: builder.mutation<void, number>({
            query: (id) => ({
                url:    BACKEND_API_ENDPOINT.ADMIN.AI_KNOWLEDGE.DOCUMENT(id),
                method: 'DELETE',
            }),
            invalidatesTags: ['AiDocument'],
        }),
    }),
})

export const {
    useGetDocumentsQuery,
    useUploadDocumentMutation,
    useDeleteDocumentMutation,
} = AdminAiKnowledgeApi
