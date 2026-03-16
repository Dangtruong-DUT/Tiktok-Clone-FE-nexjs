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

export type UpdateUserResType = ResType<UserType, void>;

export type MetaPagination = {
    total_pages: number;
    page: number;
    limit: number;
};

export type GetListUserResType = ResType<UserType[], MetaPagination>;
