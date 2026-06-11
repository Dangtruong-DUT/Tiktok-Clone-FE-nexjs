import { createApi } from '@reduxjs/toolkit/query/react'
import baseQueryWithReauth from '@/store/services/base/client'
import { BACKEND_API_ENDPOINT } from '@/constants/api/endpoints'
import type {
    AiDocumentAdminDto,
    AiDocumentDetailAdminDto,
    ListAiDocumentsResDto,
    UploadAiDocumentResDto,
    GetAiDocumentResDto
} from '@/types/dtos/admin/ai/admin-ai-knowledge.response.dto'

export type { AiDocumentAdminDto, AiDocumentDetailAdminDto }

interface UploadDocumentPayload {
    formData: FormData
}

export const AdminAiKnowledgeApi = createApi({
    reducerPath: 'adminAiKnowledgeApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['AiDocument'],
    keepUnusedDataFor: 60,
    endpoints: (builder) => ({
        getDocument: builder.query<GetAiDocumentResDto, string>({
            query: (uuid) => BACKEND_API_ENDPOINT.ADMIN.AI_KNOWLEDGE.DOCUMENT(uuid)
        }),

        getDocuments: builder.query<ListAiDocumentsResDto, { page?: number; perPage?: number }>({
            query: ({ page = 1, perPage = 20 } = {}) =>
                `${BACKEND_API_ENDPOINT.ADMIN.AI_KNOWLEDGE.DOCUMENTS}?page=${page}&per_page=${perPage}`,
            providesTags: ['AiDocument']
        }),

        uploadDocument: builder.mutation<UploadAiDocumentResDto, UploadDocumentPayload>({
            query: ({ formData }) => ({
                url: BACKEND_API_ENDPOINT.ADMIN.AI_KNOWLEDGE.UPLOAD,
                method: 'POST',
                body: formData
            }),
            invalidatesTags: ['AiDocument']
        }),

        deleteDocument: builder.mutation<void, string>({
            query: (uuid) => ({
                url: BACKEND_API_ENDPOINT.ADMIN.AI_KNOWLEDGE.DOCUMENT(uuid),
                method: 'DELETE'
            }),
            invalidatesTags: ['AiDocument']
        })
    })
})

export const { useLazyGetDocumentQuery, useGetDocumentsQuery, useUploadDocumentMutation, useDeleteDocumentMutation } =
    AdminAiKnowledgeApi
