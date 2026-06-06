import type { LucideIcon } from 'lucide-react'
import {
    BarChart2,
    BookOpen,
    Clock,
    FileText,
    Flag,
    MessageCircle,
    Settings,
    Sparkles,
    UserRound,
    Video,
    LayoutDashboard
} from 'lucide-react'
import { ADMIN_ROUTES } from '@/constants/routes/routes'
import type { DashboardStats } from '@/types/dtos/admin/admin-response.dto'

export interface NavItem {
    titleKey: string
    href: string
    icon: LucideIcon
    badgeKey?: keyof DashboardStats
    children?: Omit<NavItem, 'children'>[]
}

export interface NavGroup {
    labelKey: string
    items: NavItem[]
}

export const ADMIN_NAV_GROUPS: NavGroup[] = [
    {
        labelKey: 'dashboard.title',
        items: [
            { titleKey: 'dashboard.title', href: ADMIN_ROUTES.DASHBOARD, icon: LayoutDashboard }
        ]
    },
    {
        labelKey: 'shell.navGroups.manage',
        items: [
            { titleKey: 'users.title', href: ADMIN_ROUTES.USERS, icon: UserRound },
            { titleKey: 'moderation.title', href: ADMIN_ROUTES.POSTS, icon: Video },
            { titleKey: 'comments.title', href: ADMIN_ROUTES.COMMENTS, icon: MessageCircle }
        ]
    },
    {
        labelKey: 'shell.navGroups.moderate',
        items: [{ titleKey: 'appeals.title', href: ADMIN_ROUTES.APPEALS, icon: Flag, badgeKey: 'pending_appeals' }]
    },
    {
        labelKey: 'shell.navGroups.system',
        items: [
            { titleKey: 'activity.title', href: ADMIN_ROUTES.ACTIVITY, icon: Clock },
            { titleKey: 'settings.title', href: ADMIN_ROUTES.SETTINGS, icon: Settings }
        ]
    },
    {
        labelKey: 'aiStudio.title',
        items: [
            { titleKey: 'aiStudio.nav.overview', href: ADMIN_ROUTES.AI_STUDIO, icon: BarChart2 },
            { titleKey: 'aiStudio.nav.promptTemplates', href: ADMIN_ROUTES.AI_STUDIO_PROMPT_TEMPLATES, icon: FileText },
            { titleKey: 'aiStudio.nav.knowledge', href: ADMIN_ROUTES.AI_STUDIO_KNOWLEDGE, icon: BookOpen }
        ]
    }
]
