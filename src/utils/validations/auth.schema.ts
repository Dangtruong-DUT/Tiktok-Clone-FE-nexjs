import z from "zod";

export const LoginReqBody = z
    .object({
        email: z.email(),
        password: z.string().min(6).max(100),
    })
    .strict();

export type LoginReqBodyType = z.TypeOf<typeof LoginReqBody>;

export const RegisterReqBody = z
    .object({
        name: z.string().min(1).max(50),
        email: z.email(),
        password: z.string().min(6).max(100),
        confirm_password: z.string().min(6).max(100),
        date_of_birth: z.iso.datetime(),
    })
    .strict()
    .superRefine(({ confirm_password, password }, ctx) => {
        if (confirm_password !== password) {
            ctx.addIssue({
                code: "custom",
                message: "Passwords do not match",
                path: ["confirm_password"],
            });
        }
    });

export type RegisterReqBodyType = z.TypeOf<typeof RegisterReqBody>;

export const RefreshTokenReqBody = z
    .object({
        refreshToken: z.string(),
    })
    .strict();

export type RefreshTokenReqBodyType = z.TypeOf<typeof RefreshTokenReqBody>;

export const LogoutReqBody = z
    .object({
        refresh_token: z.string(),
    })
    .strict();

export type LogoutReqBodyType = z.TypeOf<typeof LogoutReqBody>;

export const forgotPasswordReqBody = z
    .object({
        email: z.email(),
    })
    .strict();
export type ForgotPasswordReqBodyType = z.TypeOf<typeof forgotPasswordReqBody>;

export const resetPasswordReqBody = z
    .object({
        password: z.string().min(6).max(100),
        confirm_password: z.string().min(6).max(100),
    })
    .strict()
    .superRefine(({ confirm_password, password }, ctx) => {
        if (confirm_password !== password) {
            ctx.addIssue({
                code: "custom",
                message: "Passwords do not match",
                path: ["confirm_password"],
            });
        }
    });
export type ResetPasswordReqBodyType = z.TypeOf<typeof resetPasswordReqBody>;
