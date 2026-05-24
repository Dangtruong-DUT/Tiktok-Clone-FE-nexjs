import { HASHTAG_CAPTURE_REGEX, MENTION_CAPTURE_REGEX } from '@/constants/regex'

const unique = (values: string[]): string[] => Array.from(new Set(values))

export const extractMentionUsernames = (content: string): string[] => {
    if (!content) return []

    return unique(
        Array.from(content.matchAll(MENTION_CAPTURE_REGEX), (match) => (match[1] ?? '').trim()).filter(
            (value) => value !== ''
        )
    )
}

export const extractHashtags = (content: string): string[] => {
    if (!content) return []

    return unique(
        Array.from(content.matchAll(HASHTAG_CAPTURE_REGEX), (match) => (match[1] ?? '').trim().toLowerCase()).filter(
            (value) => value !== ''
        )
    )
}
