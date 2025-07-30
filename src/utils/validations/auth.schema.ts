import z from "zod";

export const LoginBody = z
    .object({
        email: z.email(),
        password: z.string().min(6).max(100),
    })
    .strict();

export type LoginBodyType = z.TypeOf<typeof LoginBody>;

export const RegisterBody = z
    .object({
        name: z.string().min(1).max(50),
        email: z.email(),
        password: z.string().min(6).max(100),
        confirm_password: z.string().min(6).max(100),
        date_of_birth: z.iso.datetime(),
    })
    .strict();

export type RegisterBodyType = z.TypeOf<typeof RegisterBody>;

export const RefreshTokenBody = z
    .object({
        refreshToken: z.string(),
    })
    .strict();

export type RefreshTokenBodyType = z.TypeOf<typeof RefreshTokenBody>;

export const RefreshTokenRes = z.object({
    data: z.object({
        accessToken: z.string(),
        refreshToken: z.string(),
    }),
    message: z.string(),
});

export const LogoutBody = z
    .object({
        refreshToken: z.string(),
    })
    .strict();

export type LogoutBodyType = z.TypeOf<typeof LogoutBody>;
