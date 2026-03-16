import { ResType } from "@/types/response/response.type";
import { UserType } from "@/types/schemas/User.schema";

export type LoginResponseType = ResType<
    {
        access_token: string;
        refresh_token: string;
        user: UserType;
    },
    void
>;

export type RegisterResponseType = ResType<
    {
        access_token: string;
        refresh_token: string;
        user: UserType;
    },
    void
>;

export type LogoutResType = { message: string };

export type RefreshTokenRes = ResType<
    {
        access_token: string;
        refresh_token: string;
    },
    void
>;
