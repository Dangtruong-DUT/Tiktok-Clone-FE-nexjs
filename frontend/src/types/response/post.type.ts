import { PosterType } from "@/constants/enum";
import { ResType } from "@/types/response/response.type";
import { CommentType } from "@/types/schemas/comment.schemas";
import { TikTokPostType } from "@/types/schemas/TikTokPost.schemas";

export type MetaDataListPost = {
    page: number;
    limit: number;
    total_pages: number;
};

export type MetaDataListComment = MetaDataListPost & {
    type: PosterType.COMMENT;
};

export type GetPostDetailRes = ResType<TikTokPostType, MetaDataListPost>;

export type GetListPostRes = ResType<
    {
        posts: TikTokPostType[];
    },
    MetaDataListPost
>;

export type GetListCommentRes = ResType<
    {
        posts: CommentType[];
    },
    MetaDataListComment
>;

export type SearchPostRes = ResType<TikTokPostType[], MetaDataListPost>;
