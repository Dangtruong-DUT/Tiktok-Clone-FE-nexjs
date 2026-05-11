export type MentionType = {
    readonly id: number
    readonly username: string
    readonly start?: number | null
    readonly end?: number | null
}

/** @deprecated use MentionType */
export type MentionSchema = MentionType
