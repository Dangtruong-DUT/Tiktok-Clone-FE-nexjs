import { Role } from '@/constants/enum'
import { SNAPISTUDIO_ROUTES } from '@/constants/routes/routes'
import { Settings, LayoutPanelLeft, BookUp, Scale, Sparkles, CalendarDays, Clock, HeartPulse } from 'lucide-react'

interface NavItem {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    title: any
    href: string
    Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
    role?: Role[]
}

export const navItems: NavItem[] = [
    {
        title: 'home',
        href: SNAPISTUDIO_ROUTES.ROOT,
        Icon: LayoutPanelLeft,
        role: [Role.USER, Role.SUPER_ADMIN]
    },
    {
        title: 'posts',
        href: SNAPISTUDIO_ROUTES.CONTENT,
        Icon: BookUp,
        role: [Role.USER, Role.SUPER_ADMIN]
    },
    {
        title: 'ai_chat',
        href: SNAPISTUDIO_ROUTES.AI_CHAT,
        Icon: Sparkles,
        role: [Role.USER, Role.SUPER_ADMIN]
    },
    {
        title: 'calendar',
        href: SNAPISTUDIO_ROUTES.AI_CALENDAR,
        Icon: CalendarDays,
        role: [Role.USER, Role.SUPER_ADMIN]
    },
    {
        title: 'scheduled',
        href: SNAPISTUDIO_ROUTES.SCHEDULED_POSTS,
        Icon: Clock,
        role: [Role.USER, Role.SUPER_ADMIN]
    },
    {
        title: 'wellness',
        href: SNAPISTUDIO_ROUTES.WELLNESS,
        Icon: HeartPulse,
        role: [Role.USER, Role.SUPER_ADMIN]
    },
    {
        title: 'appeals',
        href: SNAPISTUDIO_ROUTES.APPEALS,
        Icon: Scale,
        role: [Role.USER, Role.SUPER_ADMIN]
    },
    {
        title: 'settings',
        href: SNAPISTUDIO_ROUTES.SETTINGS,
        Icon: Settings,
        role: [Role.USER, Role.SUPER_ADMIN]
    }
]
