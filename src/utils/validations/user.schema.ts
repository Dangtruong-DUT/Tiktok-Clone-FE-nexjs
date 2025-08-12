import z from "zod";

export const VerifyEmailReqBody = z.object({
    email_verify_token: z.string().min(10),
});

export type VerifyEmailReqBodyType = z.infer<typeof VerifyEmailReqBody>;

export const followUserReqBody = z.object({
    user_id: z.string().min(10),
});

export type FollowUserReqBodyType = z.infer<typeof followUserReqBody>;
