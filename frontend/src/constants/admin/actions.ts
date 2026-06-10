import type { LucideIcon } from 'lucide-react'
import { Ban, Check, KeyRound, Mail, RefreshCw, ShieldCheck, Trash2, UserX, X } from 'lucide-react'

export const ADMIN_ACTIONS = {
    BAN: 'ban',
    UNBAN: 'unban',
    DELETE_USER: 'delete_user',
    RESTORE_USER: 'restore_user',
    RESET_USER_PASSWORD: 'reset_user_password',
    SEND_EMAIL_TO_USER: 'send_email_to_user',
    DELETE_POST: 'delete_post',
    RESTORE_POST: 'restore_post',
    DELETE_COMMENT: 'delete_comment',
    RESTORE_COMMENT: 'restore_comment',
    APPROVE_APPEAL: 'approve_appeal',
    REJECT_APPEAL: 'reject_appeal',
    UPDATE: 'update'
} as const

export type AdminAction = (typeof ADMIN_ACTIONS)[keyof typeof ADMIN_ACTIONS]

export const ADMIN_RESOURCE_TYPES = {
    USER: 'user',
    POST: 'post',
    COMMENT: 'comment',
    MESSAGE: 'message',
    APPEAL: 'appeal',
    RE_POST: 're-post',
    QUOTE_POST: 'quote-post'
} as const

export type AdminResourceType = (typeof ADMIN_RESOURCE_TYPES)[keyof typeof ADMIN_RESOURCE_TYPES]

export interface ActionIconConfig {
    icon: LucideIcon
    className: string
}

export const ADMIN_ACTION_ICONS: Record<string, ActionIconConfig> = {
    [ADMIN_ACTIONS.BAN]: { icon: Ban, className: 'bg-red-500/15 text-red-400' },
    [ADMIN_ACTIONS.DELETE_POST]: { icon: Trash2, className: 'bg-red-500/15 text-red-400' },
    [ADMIN_ACTIONS.DELETE_USER]: { icon: UserX, className: 'bg-red-500/15 text-red-400' },
    [ADMIN_ACTIONS.DELETE_COMMENT]: { icon: Trash2, className: 'bg-orange-500/15 text-orange-400' },
    [ADMIN_ACTIONS.REJECT_APPEAL]: { icon: X, className: 'bg-red-500/15 text-red-400' },
    [ADMIN_ACTIONS.APPROVE_APPEAL]: { icon: Check, className: 'bg-emerald-500/15 text-emerald-400' },
    [ADMIN_ACTIONS.UNBAN]: { icon: ShieldCheck, className: 'bg-emerald-500/15 text-emerald-400' },
    [ADMIN_ACTIONS.RESTORE_USER]: { icon: ShieldCheck, className: 'bg-emerald-500/15 text-emerald-400' },
    [ADMIN_ACTIONS.RESTORE_POST]: { icon: RefreshCw, className: 'bg-emerald-500/15 text-emerald-400' },
    [ADMIN_ACTIONS.RESTORE_COMMENT]: { icon: RefreshCw, className: 'bg-emerald-500/15 text-emerald-400' },
    [ADMIN_ACTIONS.SEND_EMAIL_TO_USER]: { icon: Mail, className: 'bg-blue-500/15 text-blue-400' },
    [ADMIN_ACTIONS.RESET_USER_PASSWORD]: { icon: KeyRound, className: 'bg-blue-500/15 text-blue-400' },
    [ADMIN_ACTIONS.UPDATE]: { icon: RefreshCw, className: 'bg-zinc-500/15 text-zinc-400' }
}
