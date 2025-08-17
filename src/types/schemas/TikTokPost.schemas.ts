import { Audience, PosterType } from "@/constants/enum";
import { HashtagType } from "@/types/schemas/Hashtag.schemas";
import { Media } from "@/types/schemas/Media.schema";
import { UserType } from "@/types/schemas/User.schema";

export type TikTokPostType = {
    _id: string;
    user_id: string;
    type: PosterType;
    audience: Audience;
    content: string;
    parent_id: string | null;
    hashtags: HashtagType[];
    created_at: string;
    updated_at: string;
    medias: Media[];
    mentions: {
        _id: string;
        name: string;
        username: string;
        email: string;
    }[];
    likes_count: number;
    bookmarks_count: number;
    repost_count: number;
    comment_count: number;
    quote_post_count: number;
    is_liked: boolean;
    is_bookmarked: boolean;
    guest_views: number;
    user_views: number;
    author: UserType;
};
