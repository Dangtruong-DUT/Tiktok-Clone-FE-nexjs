import type { Appeal } from '@/types/models/appeal.model'

interface AppealUserSummary {
    readonly id: number
    readonly uuid: string
    readonly username: string
    readonly email?: string | null
    readonly avatar?: string | null
}

export interface AdminAppeal extends Appeal {
    readonly user?: AppealUserSummary | null
    readonly reviewer?: AppealUserSummary | null
}
