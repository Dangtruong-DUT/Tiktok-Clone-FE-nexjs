'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ADMIN_ROUTES } from '@/constants/admin.const'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { ModeToggle } from '@/components/dark-mode-toggle'
import SelectLanguage from '@/components/select-language'
import useCurrentUserData from '@/hooks/data/useCurrentUserData'
import DialogConfirmLogout from '@/components/dialog-confirm-Logout'
import { usePathname } from 'next/navigation'

export function AdminTopbar() {
    const t = useTranslations('AdminPage')
    const currentUser = useCurrentUserData()
    const [isConfirmLogoutOpen, setIsConfirmLogoutOpen] = useState(false)
    const pathname = usePathname()

    const locale = pathname?.split('/')[1]
    const getI18nPath = (route: string): string => `/${locale}${route}`

    const routeLabels = [
        { href: ADMIN_ROUTES.DASHBOARD, label: t('dashboard.title') },
        { href: ADMIN_ROUTES.USERS, label: t('users.title') },
        { href: ADMIN_ROUTES.POSTS, label: t('moderation.title') },
        { href: ADMIN_ROUTES.COMMENTS, label: t('comments.title') },
        { href: ADMIN_ROUTES.APPEALS, label: t('appeals.title') },
        { href: ADMIN_ROUTES.ACTIVITY, label: t('activity.title') },
        { href: ADMIN_ROUTES.SETTINGS, label: t('settings.title') }
    ]

    const currentRoute = routeLabels.find((route) => pathname?.includes(getI18nPath(route.href)))
    const breadcrumbs = [
        { label: t('breadcrumbs.admin'), href: getI18nPath(ADMIN_ROUTES.DASHBOARD) },
        ...(currentRoute && currentRoute.href !== ADMIN_ROUTES.DASHBOARD ? [{ label: currentRoute.label }] : [])
    ]

    const displayName = currentUser?.name || currentUser?.username || t('shell.unknownUser')
    const fallbackAvatar = (displayName.charAt(0) || 'A').toUpperCase()

    return (
        <header className='sticky top-0 z-30 border-b bg-background/95 px-4 md:px-8'>
            <div className='mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between'>
                <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                    <Breadcrumb>
                        <BreadcrumbList>
                            {breadcrumbs.map((crumb, idx) => (
                                <BreadcrumbItem key={`${crumb.label}-${idx}`}>
                                    {crumb.href ? (
                                        <BreadcrumbLink asChild>
                                            <Link href={crumb.href}>{crumb.label}</Link>
                                        </BreadcrumbLink>
                                    ) : (
                                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                                    )}
                                    {idx < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                                </BreadcrumbItem>
                            ))}
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>

                <div className='flex items-center gap-2 md:gap-3'>
                    <SelectLanguage />
                    <ModeToggle />

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant='ghost'
                                className='h-10 rounded-full px-2 md:px-3 hover:bg-muted'
                                aria-label={t('shell.accountMenu')}
                            >
                                <Avatar className='size-8 shrink-0'>
                                    <AvatarImage src={currentUser?.avatar} alt={displayName} className='object-cover' />
                                    <AvatarFallback>{fallbackAvatar}</AvatarFallback>
                                </Avatar>
                                <span className='ml-2 hidden max-w-[180px] truncate text-sm md:inline-block'>
                                    {displayName}
                                </span>
                            </Button>
                        </PopoverTrigger>

                        <PopoverContent className='w-64 p-2' align='end'>
                            <div className='mb-2 rounded-md bg-muted/60 p-3'>
                                <p className='truncate text-sm font-semibold'>{displayName}</p>
                                <p className='truncate text-xs text-muted-foreground'>{currentUser?.email || ''}</p>
                            </div>

                            <div className='grid gap-1'>
                                <Link href={ADMIN_ROUTES.SETTINGS} className='block'>
                                    <Button variant='ghost' className='w-full justify-start'>
                                        {t('shell.settings')}
                                    </Button>
                                </Link>

                                <Link href={`/@${currentUser?.username || ''}`} className='block'>
                                    <Button variant='ghost' className='w-full justify-start'>
                                        {t('shell.profile')}
                                    </Button>
                                </Link>

                                <Button
                                    variant='ghost'
                                    className='w-full justify-start text-destructive hover:bg-destructive/10'
                                    onClick={() => setIsConfirmLogoutOpen(true)}
                                >
                                    {t('shell.logout')}
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
            <DialogConfirmLogout isOpen={isConfirmLogoutOpen} onOpenChange={setIsConfirmLogoutOpen} />
        </header>
    )
}
