import type { LucideIcon } from 'lucide-react'
import { CalendarClock, Clock, Flag, MessageCircle, Settings, Sparkles, UserRound, Video } from 'lucide-react'
import { ADMIN_ROUTES } from '@/constants/routes/routes'
import type { DashboardStats } from '@/types/dtos/admin/admin-response.dto'

export interface NavItem {
    titleKey: string
    href: string
    icon: LucideIcon
    badgeKey?: keyof DashboardStats
}

export interface NavGroup {
    labelKey: string
    items: NavItem[]
}

export const ADMIN_NAV_GROUPS: NavGroup[] = [
    {
        labelKey: 'shell.navGroups.manage',
        items: [
            { titleKey: 'users.title', href: ADMIN_ROUTES.USERS, icon: UserRound },
            { titleKey: 'moderation.title', href: ADMIN_ROUTES.POSTS, icon: Video },
            { titleKey: 'comments.title', href: ADMIN_ROUTES.COMMENTS, icon: MessageCircle },
        ],
    },
    {
        labelKey: 'shell.navGroups.moderate',
        items: [
            { titleKey: 'appeals.title', href: ADMIN_ROUTES.APPEALS, icon: Flag, badgeKey: 'pending_appeals' },
        ],
    },
    {
        labelKey: 'shell.navGroups.system',
        items: [
            { titleKey: 'activity.title', href: ADMIN_ROUTES.ACTIVITY, icon: Clock },
            { titleKey: 'aiStudio.title', href: ADMIN_ROUTES.AI_STUDIO, icon: Sparkles },
            { titleKey: 'scheduledPosts.title', href: ADMIN_ROUTES.SCHEDULED_POSTS, icon: CalendarClock },
            { titleKey: 'settings.title', href: ADMIN_ROUTES.SETTINGS, icon: Settings },
        ],
    },
] as const
