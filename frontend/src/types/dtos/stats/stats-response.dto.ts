export interface UserIndicatorItem {
    readonly date: string
    readonly likes_count: number
    readonly guests_view: number
    readonly users_view: number
    readonly comments_count: number
}

export interface UserIndicatorsData {
    readonly likes_count: number
    readonly guests_view: number
    readonly users_view: number
    readonly comments_count: number
    readonly indicator: UserIndicatorItem[]
}

export interface UserIndicatorsResponse {
    readonly message: string
    readonly data: UserIndicatorsData
}
