import z from "zod";

export const CommentBody = z
    .object({
        content: z.string().min(1, {
            message: "Content must be at least 1 character.",
        }),
        post_id: z.string().min(1, {
            message: "Post ID is required.",
        }),
    })
    .strict();
export type CommentBodyType = z.TypeOf<typeof CommentBody>;
