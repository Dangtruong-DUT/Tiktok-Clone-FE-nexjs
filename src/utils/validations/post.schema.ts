import { Audience, MediaType, PosterType } from "@/constants/enum";
import z from "zod";

export const MediaSchema = z.object({
    url: z.string(),
    type: z.union([z.literal(MediaType.IMAGE), z.literal(MediaType.VIDEO)]),
});

export const CreatePostReqBody = z.object({
    type: z.union([z.literal(PosterType.POST), z.literal(PosterType.QUOTE_POST), z.literal(PosterType.RE_POST)]),
    audience: z.union([z.literal(Audience.PUBLIC), z.literal(Audience.FRIENDS), z.literal(Audience.PRIVATE)]),
    content: z.string().min(0).max(4000),
    hashtags: z.array(z.string()).optional(),
    mentions: z.array(z.string()).optional(),
    medias: z.array(MediaSchema),
    thumbnail_url: z.string(),
});

export type CreatePostReqBodyType = z.infer<typeof CreatePostReqBody>;

export const CreateCommentsReqBody = z
    .object({
        type: z.literal(PosterType.COMMENT),
        audience: z.union([z.literal(Audience.PUBLIC), z.literal(Audience.FRIENDS), z.literal(Audience.PRIVATE)]),
        content: z.string().min(0).max(500),
        hashtags: z.array(z.string()).optional(),
        mentions: z.array(z.string()).optional(),
        parent_id: z.string().optional(),
        medias: z.array(MediaSchema).optional(),
    })
    .strict();

export type CreateCommentsReqBodyType = z.infer<typeof CreateCommentsReqBody>;
