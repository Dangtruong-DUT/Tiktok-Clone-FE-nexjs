'use client'

import { ReactNode, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Link } from '@/i18n/navigation'
import { ADMIN_ROUTES } from '@/constants/routes/admin'
import { useTranslations } from 'next-intl'
import useCurrentUserData from '@/hooks/data/useCurrentUserData'
import DialogConfirmLogout from '@/components/confirm-logout-dialog'
import { PanelLeft } from 'lucide-react'
import type { BreadcrumbEntry } from './admin-layout'
import { Separator } from '@/components/ui/separator'

interface AdminTopbarProps {
    title?: string
    description?: string
    breadcrumbs?: BreadcrumbEntry[]
    actions?: ReactNode
    onToggleSidebar: () => void
}

export function AdminTopbar({ title, breadcrumbs, actions, onToggleSidebar }: AdminTopbarProps) {
    const t = useTranslations('AdminPage')
    const currentUser = useCurrentUserData()
    const [isConfirmLogoutOpen, setIsConfirmLogoutOpen] = useState(false)

    const displayName = currentUser?.name || currentUser?.username || t('shell.unknownUser')
    const fallbackAvatar = (displayName.charAt(0) || 'A').toUpperCase()

    return (
        <header className='sticky top-0 z-30 border-b bg-background/95 backdrop-blur-sm'>
            <div className='flex h-14 items-center gap-2 px-4 md:px-5'>
                {/* Toggle sidebar */}
                <Button
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground'
                    onClick={onToggleSidebar}
                    aria-label='Toggle sidebar'
                >
                    <PanelLeft className='h-4 w-4' />
                </Button>

                {/* Breadcrumbs + Title */}
                <div className='flex-1 min-w-0'>
                    {breadcrumbs && breadcrumbs.length > 0 && (
                        <Breadcrumb>
                            <BreadcrumbList>
                                {breadcrumbs.map((crumb, idx) => (
                                    <BreadcrumbItem key={idx}>
                                        {crumb.href ? (
                                            <BreadcrumbLink asChild>
                                                <Link href={crumb.href} className='text-xs'>
                                                    {crumb.label}
                                                </Link>
                                            </BreadcrumbLink>
                                        ) : (
                                            <BreadcrumbPage className='text-xs'>{crumb.label}</BreadcrumbPage>
                                        )}
                                        {idx < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                                    </BreadcrumbItem>
                                ))}
                            </BreadcrumbList>
                        </Breadcrumb>
                    )}
                    {title && <h1 className={'sr-only'}>{title}</h1>}
                </div>

                {/* Page actions slot */}
                {actions && <div className='flex shrink-0 items-center gap-2'>{actions}</div>}

                {/* Controls */}
                <div className='flex items-center gap-1 shrink-0'>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant='ghost'
                                className='h-9 rounded-full px-2 hover:bg-muted'
                                aria-label={t('shell.accountMenu')}
                            >
                                <Avatar className='size-7 shrink-0'>
                                    <AvatarImage src={currentUser?.avatar} alt={displayName} className='object-cover' />
                                    <AvatarFallback className='text-xs'>{fallbackAvatar}</AvatarFallback>
                                </Avatar>
                                <span className='ml-2 hidden max-w-[140px] truncate text-sm md:inline-block'>
                                    {displayName}
                                </span>
                            </Button>
                        </PopoverTrigger>

                        <PopoverContent className='w-56 p-2' align='end'>
                            <div className='mb-2 rounded-md bg-muted/60 p-3'>
                                <p className='truncate text-sm font-semibold'>{displayName}</p>
                                <p className='truncate text-xs text-muted-foreground'>{currentUser?.email || ''}</p>
                            </div>

                            <div className='grid gap-0.5'>
                                <Link href={ADMIN_ROUTES.SETTINGS} className='block'>
                                    <Button variant='ghost' size='sm' className='w-full justify-start'>
                                        {t('shell.settings')}
                                    </Button>
                                </Link>
                                <Link href={`/@${currentUser?.username || ''}`} className='block'>
                                    <Button variant='ghost' size='sm' className='w-full justify-start'>
                                        {t('shell.profile')}
                                    </Button>
                                </Link>
                                <Separator className='my-1' />
                                <Button
                                    variant='ghost'
                                    size='sm'
                                    className='w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive'
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
