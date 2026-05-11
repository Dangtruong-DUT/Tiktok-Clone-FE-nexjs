'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { ADMIN_ROUTES } from '@/constants/admin.const'

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
            active: pathname === getI18nPath(ADMIN_ROUTES.DASHBOARD)
        },
        {
            title: t('users.title'),
            href: ADMIN_ROUTES.USERS,
            active: pathname?.includes(getI18nPath(ADMIN_ROUTES.USERS))
        },
        {
            title: t('moderation.title'),
            href: ADMIN_ROUTES.POSTS,
            active: pathname?.includes(getI18nPath(ADMIN_ROUTES.POSTS))
        },
        {
            title: t('comments.title'),
            href: ADMIN_ROUTES.COMMENTS,
            active: pathname?.includes(getI18nPath(ADMIN_ROUTES.COMMENTS))
        },
        {
            title: t('appeals.title'),
            href: ADMIN_ROUTES.APPEALS,
            active: pathname?.includes(getI18nPath(ADMIN_ROUTES.APPEALS))
        },
        {
            title: t('activity.title'),
            href: ADMIN_ROUTES.ACTIVITY,
            active: pathname?.includes(getI18nPath(ADMIN_ROUTES.ACTIVITY))
        },
        {
            title: t('settings.title'),
            href: ADMIN_ROUTES.SETTINGS,
            active: pathname?.includes(getI18nPath(ADMIN_ROUTES.SETTINGS))
        }
    ]

    return (
        <aside className='sticky top-0 h-screen w-64 border-r border-border bg-background'>
            {/* Logo/Header */}
            <div className='px-5 py-6 border-b border-border'>
                <h1 className='text-base font-semibold text-foreground'>{t('shell.panelLabel')}</h1>
            </div>

            {/* Navigation */}
            <nav className='px-3 py-4 space-y-1 overflow-y-auto'>
                {menuItems.map((item) => (
                    <Link
                        key={item.href}
                        href={getI18nPath(item.href)}
                        aria-current={item.active ? 'page' : undefined}
                        className={cn(
                            'group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                            item.active
                                ? 'bg-muted/80 text-foreground shadow-sm'
                                : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                        )}
                    >
                        <span>{item.title}</span>
                    </Link>
                ))}
            </nav>
        </aside>
    )
}
