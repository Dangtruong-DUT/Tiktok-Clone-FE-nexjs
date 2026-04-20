import { Role } from '@/constants/enum'
import { Settings, LayoutPanelLeft, BookUp, Scale } from 'lucide-react'

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
        href: '/snapistudio',
        Icon: LayoutPanelLeft,
        role: [Role.USER, Role.SUPER_ADMIN]
    },
    {
        title: 'posts',
        href: '/snapistudio/content',
        Icon: BookUp,
        role: [Role.USER, Role.SUPER_ADMIN]
    },
    {
        title: 'appeals',
        href: '/snapistudio/appeals',
        Icon: Scale,
        role: [Role.USER, Role.SUPER_ADMIN]
    },
    {
        title: 'settings',
        href: '/snapistudio/settings',
        Icon: Settings,
        role: [Role.USER, Role.SUPER_ADMIN]
    }
]
