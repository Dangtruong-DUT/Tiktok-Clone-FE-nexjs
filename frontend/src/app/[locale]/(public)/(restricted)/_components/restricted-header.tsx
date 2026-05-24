'use client'

import { useMemo, useState } from 'react'
import { Link } from '@/i18n/navigation'
import { useAppSelector } from '@/store/hooks'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import LogoBrand from '@/components/logo-brand'
import { useTranslations } from 'next-intl'
import DialogConfirmLogout from '@/components/common/confirm-logout-dialog'

export function RestrictedHeader() {
    const t = useTranslations('BannedPage')
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
    const profile = useAppSelector((state) => state.auth.user_profile)

    const initials = useMemo(() => {
        const name = profile?.name?.trim() || profile?.username?.trim() || ''
        if (!name) return 'U'
        return name.charAt(0).toUpperCase()
    }, [profile?.name, profile?.username])

    const displayName = profile?.name?.trim() || profile?.username?.trim() || 'User'

    return (
        <header className='flex items-center justify-between px-4 h-[3.75rem] bg-white text-black shrink-0'>
            <Link href='/'>
                <LogoBrand className='h-10' />
                <span className='sr-only'>tiktok</span>
            </Link>

            <div className='flex items-center gap-3'>
                <div className='hidden sm:flex items-center gap-2'>
                    <span className='text-sm font-semibold text-black'>{displayName}</span>
                </div>

                <Avatar className='h-8 w-8 border border-neutral-200'>
                    <AvatarImage src={profile?.avatar || ''} alt={displayName} />
                    <AvatarFallback className='bg-neutral-100 text-xs font-semibold text-neutral-600'>
                        {initials}
                    </AvatarFallback>
                </Avatar>

                <button
                    type='button'
                    onClick={() => setIsLogoutModalOpen(true)}
                    className='flex items-center justify-center rounded-full p-2 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-black'
                    aria-label={t('logoutAction')}
                    title={t('logoutAction')}
                >
                    <LogOut className='h-4.5 w-4.5' />
                </button>
            </div>

            <DialogConfirmLogout isOpen={isLogoutModalOpen} onOpenChange={setIsLogoutModalOpen} />
        </header>
    )
}
