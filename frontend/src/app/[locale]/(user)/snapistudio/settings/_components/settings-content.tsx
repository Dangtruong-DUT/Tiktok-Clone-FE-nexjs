'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { UserCircle, Lock, ShieldCheck, MailCheck } from 'lucide-react'
import UpdateProfileForm from '../update-profile-form'
import ChangePasswordForm from '../change-password-form'
import PrivacySettingsForm from '../privacy-settings-form'
import VerifyEmailForm from '../verify-email-form'

type Tab = 'profile' | 'security' | 'privacy' | 'email'

export function SettingsContent() {
    const t = useTranslations('SnapiStudio.settings')
    const [active, setActive] = useState<Tab>('profile')

    const tabs: { id: Tab; icon: React.ElementType; label: string }[] = [
        { id: 'profile', icon: UserCircle, label: t('nav.profile') },
        { id: 'security', icon: Lock, label: t('nav.security') },
        { id: 'privacy', icon: ShieldCheck, label: t('nav.privacy') },
        { id: 'email', icon: MailCheck, label: t('nav.email') }
    ]

    return (
        <div className='flex flex-col gap-6 lg:flex-row lg:gap-8'>
            {/* Sidebar Nav */}
            <aside className='w-full lg:w-56 shrink-0'>
                <nav className='flex flex-row gap-1 overflow-x-auto lg:flex-col lg:overflow-visible rounded-xl border bg-card p-2 shadow-xs'>
                    {tabs.map(({ id, icon: Icon, label }) => (
                        <button
                            key={id}
                            type='button'
                            onClick={() => setActive(id)}
                            className={cn(
                                'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors text-left whitespace-nowrap',
                                active === id
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            )}
                        >
                            <Icon className='h-4 w-4 shrink-0' />
                            {label}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Content */}
            <div className='min-w-0 flex-1'>
                <div className='rounded-xl border bg-card p-6 shadow-xs'>
                    {active === 'profile' && <UpdateProfileForm />}
                    {active === 'security' && <ChangePasswordForm />}
                    {active === 'privacy' && <PrivacySettingsForm />}
                    {active === 'email' && <VerifyEmailForm />}
                </div>
            </div>
        </div>
    )
}
