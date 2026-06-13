import { PostPreview } from './post-preview'
import { CommentPreview } from './comment-preview'
import { UserPreview } from './user-preview'
import type { ResourcePreview as ResourcePreviewType } from '@/types/models/appeal.model'
import { RESOURCE_PREVIEW_TYPES } from '@/constants/appeal'

type ResourcePreviewProps = {
    preview?: ResourcePreviewType
}

export function ResourcePreview({ preview }: ResourcePreviewProps) {
    if (!preview) return null

    switch (preview.type) {
        case RESOURCE_PREVIEW_TYPES.POST:
            return <PostPreview preview={preview} />
        case RESOURCE_PREVIEW_TYPES.COMMENT:
            return <CommentPreview preview={preview} />
        case RESOURCE_PREVIEW_TYPES.USER:
            return <UserPreview preview={preview} />
        default:
            return null
    }
}
