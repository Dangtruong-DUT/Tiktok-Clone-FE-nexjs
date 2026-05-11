import { PrivacyVisibility } from '@/constants/enum'

export type UserSettingsType = {
    readonly id: number
    readonly liked_videos_visibility: PrivacyVisibility
    readonly bookmarked_videos_visibility: PrivacyVisibility
    readonly followers_visibility: PrivacyVisibility
    readonly following_visibility: PrivacyVisibility
    readonly updated_at: string
    readonly created_at: string
}
