export const SearchTabId = {
    USERS: 'USERS',
    VIDEOS: 'VIDEOS'
} as const

export type SearchTabIdType = (typeof SearchTabId)[keyof typeof SearchTabId]
