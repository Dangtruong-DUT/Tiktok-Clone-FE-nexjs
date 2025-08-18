import { Audience, MediaType, PosterType } from "@/constants/enum";
import z from "zod";

export const MediaSchema = z.object({
    url: z.string(),
    type: z.enum(MediaType),
});

export const CreatePostReqBody = z.object({
    type: z.enum(PosterType),
    audience: z.enum(Audience),
    content: z.string().max(500).optional(),
    parent_id: z.string().optional(),
    hashtags: z.array(z.string()).optional(),
    mentions: z.array(z.string()).optional(),
    medias: z.array(MediaSchema),
});

export type CreatePostReqBodyType = z.infer<typeof CreatePostReqBody>;

export const CreateCommentsReqBody = z.object({
    type: z.literal(PosterType.COMMENT),
    audience: z.enum(Audience),
    content: z.string().max(500),
    parent_id: z.string(),
    hashtags: z.array(z.string()).optional(),
    mentions: z.array(z.string()).optional(),
    medias: z.array(MediaSchema).optional(),
});

export type CreateCommentsReqBodyType = z.infer<typeof CreateCommentsReqBody>;
