import { ResType } from "@/types/response/response.type";

export type VerifyEmailResType = ResType<
    {
        access_token: string;
        refresh_token: string;
    },
    void
>;
