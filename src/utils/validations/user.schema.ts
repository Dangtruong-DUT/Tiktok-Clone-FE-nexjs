import z from "zod";

export const VerifyEmailReqBody = z.object({
    email_verify_token: z.string().min(10),
});

export type VerifyEmailReqBodyType = z.infer<typeof VerifyEmailReqBody>;

export const followUserReqBody = z.object({
    user_id: z.string().min(10),
});

export type FollowUserReqBodyType = z.infer<typeof followUserReqBody>;

export const ChangePasswordBody = z
    .object({
        current_password: z.string().min(6).max(100),
        password: z.string().min(6).max(100),
        confirm_password: z.string().min(6).max(100),
    })
    .strict()
    .superRefine(({ confirm_password, password }, ctx) => {
        if (confirm_password !== password) {
            ctx.addIssue({
                code: "custom",
                message: "Mật khẩu mới không khớp",
                path: ["confirm_password"],
            });
        }
    });

export type ChangePasswordBodyType = z.TypeOf<typeof ChangePasswordBody>;

export const UpdateUserBody = z.object({
    name: z.string().min(2).max(100).optional(),
    date_of_birth: z.string().min(10).max(10).optional(),
    bio: z.string().max(300).optional(),
    location: z.string().max(100).optional(),
    website: z.string().max(100).optional(),
    username: z.string().min(2).max(100).optional(),
    avatar: z.string().optional(),
    cover_photo: z.string().optional(),
});

export type UpdateUserBodyType = z.TypeOf<typeof UpdateUserBody>;

export const GetUserIndicatorQueryParams = z.object({
    fromDate: z.string().min(10).max(30),
    toDate: z.string().min(10).max(30),
});

export type GetUserIndicatorQueryParamsType = z.TypeOf<typeof GetUserIndicatorQueryParams>;
