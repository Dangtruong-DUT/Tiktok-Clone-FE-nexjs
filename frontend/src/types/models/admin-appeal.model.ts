import type { Appeal } from '@/types/models/appeal.model'

type AppealUserSummary = {
    readonly id: number
    readonly uuid: string
    readonly username: string
    readonly email?: string | null
    readonly avatar?: string | null
}

export type AdminAppeal = Appeal & {
    readonly user?: AppealUserSummary | null
    readonly reviewer?: AppealUserSummary | null
}
