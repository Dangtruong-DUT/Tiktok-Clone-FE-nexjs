export type HashtagType = {
    readonly id: number
    readonly uuid?: string
    readonly name: string
    readonly created_at?: string
    readonly start?: number | null
    readonly end?: number | null
}

/** @deprecated use HashtagType */
export type HashtagSchema = HashtagType
