export const SortOrderConst = {
    RECENT: 'recent',
    OLDEST: 'oldest'
} as const

export type SortOrder = (typeof SortOrderConst)[keyof typeof SortOrderConst]

export const PAGINATION_DEFAULTS = {
    PER_PAGE: 20,
    MAX_PER_PAGE: 100
} as const
