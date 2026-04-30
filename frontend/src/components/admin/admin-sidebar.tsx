'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { ADMIN_ROUTES } from '@/constants/admin.const'
import { LayoutDashboard, Users, FileVideo, MessageSquare, Activity, Scale, Settings, ShieldUser } from 'lucide-react'

export function AdminSidebar() {
    const pathname = usePathname()
    const t = useTranslations('AdminPage')

    const locale = pathname?.split('/')[1]

    const getI18nPath = (route: string): string => {
        return `/${locale}${route}`
    }

    const menuItems = [
        {
            title: t('dashboard.title'),
            href: ADMIN_ROUTES.DASHBOARD,
            icon: LayoutDashboard,
            active: pathname === getI18nPath(ADMIN_ROUTES.DASHBOARD)
        },
        {
            title: t('users.title'),
            href: ADMIN_ROUTES.USERS,
            icon: Users,
            active: pathname?.includes(getI18nPath(ADMIN_ROUTES.USERS))
        },
        {
            title: t('moderation.title'),
            href: ADMIN_ROUTES.POSTS,
            icon: FileVideo,
            active: pathname?.includes(getI18nPath(ADMIN_ROUTES.POSTS))
        },
        {
            title: t('comments.title'),
            href: ADMIN_ROUTES.COMMENTS,
            icon: MessageSquare,
            active: pathname?.includes(getI18nPath(ADMIN_ROUTES.COMMENTS))
        },
        {
            title: t('appeals.title'),
            href: ADMIN_ROUTES.APPEALS,
            icon: Scale,
            active: pathname?.includes(getI18nPath(ADMIN_ROUTES.APPEALS))
        },
        {
            title: t('activity.title'),
            href: ADMIN_ROUTES.ACTIVITY,
            icon: Activity,
            active: pathname?.includes(getI18nPath(ADMIN_ROUTES.ACTIVITY))
        },
        {
            title: t('settings.title'),
            href: ADMIN_ROUTES.SETTINGS,
            icon: Settings,
            active: pathname?.includes(getI18nPath(ADMIN_ROUTES.SETTINGS))
        }
    ]

    return (
        <aside className='w-64 bg-background border-r border-border h-screen sticky top-0'>
            {/* Logo/Header */}
            <div className='p-6 border-b border-border'>
                <div className='flex items-center gap-2'>
                    <ShieldUser className='h-5 w-5 text-primary' />
                    <h1 className='text-lg font-bold text-foreground'>{t('shell.panelLabel')}</h1>
                </div>
            </div>

            {/* Navigation */}
            <nav className='p-4 space-y-2 overflow-y-auto'>
                {menuItems.map((item) => {
                    const Icon = item.icon
                    return (
                        <Link
                            key={item.href}
                            href={getI18nPath(item.href)}
                            className={cn(
                                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                                item.active
                                    ? 'bg-muted text-foreground border border-border'
                                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                            )}
                        >
                            <Icon className='w-5 h-5' />
                            <span className='font-medium'>{item.title}</span>
                        </Link>
                    )
                })}
            </nav>
        </aside>
    )
}
