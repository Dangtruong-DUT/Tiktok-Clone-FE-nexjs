import { ResType } from "@/types/response/response.type";
import { TikTokPostType } from "@/types/schemas/TikTokPost.schemas";

export type MetaDataListPost = {
    page: number;
    limit: number;
    total_pages: number;
};

export type GetPostDetailRes = ResType<TikTokPostType, MetaDataListPost>;

export type GetListPostRes = ResType<TikTokPostType[], MetaDataListPost>;
