import z from "zod";

export const VerifyEmailReqBody = z.object({
    email_verify_token: z.string().min(10),
});

export type VerifyEmailReqBodyType = z.infer<typeof VerifyEmailReqBody>;
