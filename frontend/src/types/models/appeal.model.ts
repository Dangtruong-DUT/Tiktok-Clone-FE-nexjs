import { z } from 'zod'
import { APPEAL_RESOURCE_TYPE_VALUES, APPEAL_STATUS_VALUES, APPEAL_TYPE_VALUES } from '@/constants/appeal.const'

export const AppealTypeSchema = z.enum(APPEAL_TYPE_VALUES)
export const AppealStatusSchema = z.enum(APPEAL_STATUS_VALUES)
export const AppealResourceTypeSchema = z.enum(APPEAL_RESOURCE_TYPE_VALUES)

const ResourcePreviewSchema = z.union([
    z.object({
        type: z.literal('post'),
        uuid: z.string().nullable().optional(),
        content: z.string().nullable(),
        thumbnail_url: z.string().nullable().optional(),
        likes_count: z.number().optional(),
        comments_count: z.number().optional(),
        is_deleted: z.boolean().optional(),
        author: z.object({ username: z.string(), avatar: z.string().nullable() }).nullable().optional(),
        created_at: z.string().nullable().optional()
    }),
    z.object({
        type: z.literal('comment'),
        uuid: z.string().nullable().optional(),
        content: z.string().nullable(),
        is_deleted: z.boolean().optional(),
        author: z.object({ username: z.string(), avatar: z.string().nullable() }).nullable().optional(),
        created_at: z.string().nullable().optional()
    }),
    z.object({
        type: z.literal('user'),
        uuid: z.string().nullable().optional(),
        username: z.string(),
        avatar: z.string().nullable().optional(),
        is_banned: z.boolean().optional(),
        is_deleted: z.boolean().optional()
    })
])

export type ResourcePreview = z.infer<typeof ResourcePreviewSchema>

export const AppealSchema = z
    .object({
        id: z.number().int().positive(),
        uuid: z.string().nullable().optional(),
        user_id: z.number().int().positive(),
        appeal_type: AppealTypeSchema,
        resource_id: z.number().int().positive().nullable(),
        resource_type: AppealResourceTypeSchema,
        reason: z.string().nullable(),
        status: AppealStatusSchema,
        admin_response: z.string().nullable(),
        evidence_files: z
            .array(z.object({ id: z.number().int().positive(), url: z.string(), file_name: z.string() }))
            .nullable()
            .optional(),
        resource_preview: ResourcePreviewSchema.nullable().optional(),
        reviewed_at: z.string().nullable(),
        created_at: z.string(),
        updated_at: z.string()
    })
    .passthrough()

export type Appeal = z.infer<typeof AppealSchema>
