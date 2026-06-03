import type { WellnessRuleType, WellnessAction } from '@/types/models/screen-time.model'

export interface SaveWellnessRuleBody {
    type:                    WellnessRuleType
    conditions:              Record<string, number | string>
    action:                  WellnessAction
    title:                   string
    message:                 string
    is_enabled?:             boolean
    natural_language_input?: string
}
