'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import useCurrentUserData from '@/hooks/data/useCurrentUserData'
import { Link } from '@/i18n/navigation'
import { PanelLeft } from 'lucide-react'
import { USER_ROUTES, SNAPISTUDIO_ROUTES } from '@/constants/routes/routes'
import { EncodingTracker } from '@/components/studio/encoding-tracker'
import DialogConfirmLogout from '@/components/common/confirm-logout-dialog'

interface HeaderProps {
    onToggleSidebar: () => void
}

export default function Header({ onToggleSidebar }: HeaderProps) {
    const t = useTranslations('SnapiStudio.header')
    const currentUser = useCurrentUserData()
    const [isConfirmLogoutOpen, setIsConfirmLogoutOpen] = useState(false)

    const displayName = currentUser?.name || currentUser?.username || t('unknownUser')
    const fallbackAvatar = (displayName.charAt(0) || 'U').toUpperCase()

    return (
        <header className='sticky top-0 z-30 border-b bg-background/95 backdrop-blur-sm'>
            <div className='flex h-14 items-center gap-2 px-4 md:px-5'>
                <Button
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground'
                    onClick={onToggleSidebar}
                    aria-label='Toggle sidebar'
                >
                    <PanelLeft className='h-4 w-4' />
                </Button>

                <div className='flex-1 min-w-0'>
                    <EncodingTracker />
                </div>

                <div className='flex items-center gap-1 shrink-0'>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant='ghost'
                                className='h-9 rounded-full px-2 hover:bg-muted'
                                aria-label={t('accountMenu')}
                            >
                                <Avatar className='size-7 shrink-0'>
                                    <AvatarImage
                                        src={currentUser?.avatar}
                                        alt={displayName}
                                        className='shrink-0 object-cover'
                                    />
                                    <AvatarFallback className='text-xs'>{fallbackAvatar}</AvatarFallback>
                                </Avatar>
                                <span className='ml-2 hidden max-w-[140px] truncate text-sm md:inline-block'>
                                    {displayName}
                                </span>
                            </Button>
                        </PopoverTrigger>

                        <PopoverContent className='w-52 p-2' align='end'>
                            <div className='mb-2 rounded-xl bg-muted/60 p-3'>
                                <p className='truncate text-sm font-semibold'>{displayName}</p>
                                <p className='truncate text-xs text-muted-foreground'>{currentUser?.email || ''}</p>
                            </div>

                            <div className='grid gap-0.5'>
                                <Link href={SNAPISTUDIO_ROUTES.SETTINGS} className='block'>
                                    <Button variant='ghost' size='sm' className='w-full justify-start'>
                                        {t('settings')}
                                    </Button>
                                </Link>
                                <Link href={USER_ROUTES.PROFILE(currentUser?.username ?? '')} className='block'>
                                    <Button variant='ghost' size='sm' className='w-full justify-start'>
                                        {t('profile')}
                                    </Button>
                                </Link>
                                <Separator className='my-1' />
                                <Button
                                    variant='ghost'
                                    size='sm'
                                    className='w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive'
                                    onClick={() => setIsConfirmLogoutOpen(true)}
                                >
                                    {t('logout')}
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
