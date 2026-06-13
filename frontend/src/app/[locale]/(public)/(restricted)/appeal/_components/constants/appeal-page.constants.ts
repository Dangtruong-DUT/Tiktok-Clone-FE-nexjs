export const APPEAL_PAGE_STATES = {
    LOADING:        'loading',
    AUTH_REQUIRED:  'auth-required',
    INVALID:        'invalid',
    FETCH_ERROR:    'fetch-error',
    PENDING:        'pending',
    EXISTING:       'existing',
    SUCCESS:        'success',
    FORM:           'form',
} as const

export type AppealPageState = (typeof APPEAL_PAGE_STATES)[keyof typeof APPEAL_PAGE_STATES]

export const APPEAL_STATUS_STYLES = {
    pending:  { badge: 'bg-amber-50 text-amber-700 border-amber-200',   icon: 'bg-amber-100 text-amber-600',   ring: 'ring-amber-100'  },
    approved: { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: 'bg-emerald-100 text-emerald-600', ring: 'ring-emerald-100' },
    rejected: { badge: 'bg-red-50 text-red-700 border-red-200',         icon: 'bg-red-100 text-red-600',       ring: 'ring-red-100'    },
} as const satisfies Record<string, { badge: string; icon: string; ring: string }>
