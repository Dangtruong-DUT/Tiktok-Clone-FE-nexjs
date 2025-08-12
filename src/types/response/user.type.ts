import { ResType } from "@/types/response/response.type";
import { UserType } from "@/types/schemas/User.schema";

export type VerifyEmailResType = ResType<
    {
        access_token: string;
        refresh_token: string;
    },
    void
>;

export type GetUserProfileResType = ResType<UserType, void>;
