import { Audience, PosterType } from '@/constants/enum'
import type { HashtagType } from '@/types/models/hashtag.model'
import type { Media } from '@/types/models/media.model'
import type { MentionType } from '@/types/models/mention.model'
import type { UserType } from '@/types/models/user.model'

export interface TikTokPostType {
    readonly id: number
    readonly uuid: string
    readonly user_id: number
    readonly user_uuid?: string
    readonly type: PosterType
    readonly audience: Audience
    readonly content: string
    readonly parent_id: number | null
    readonly hashtags: HashtagType[]
    readonly created_at: string
    readonly updated_at: string
    readonly medias: Media[]
    readonly mentions: MentionType[]
    readonly likes_count: number
    readonly bookmarks_count: number
    readonly repost_count: number
    readonly comments_count: number
    readonly quote_post_count: number
    readonly is_liked: boolean
    readonly is_bookmarked: boolean
    readonly guest_views: number
    readonly user_views: number
    readonly author: UserType
    readonly thumbnail_url: string
    readonly thumbnail_file_id?: number | null
    readonly status?: string
    readonly scheduled_post?: {
        uuid: string
        status: string
        scheduled_at: string
    } | null
}
