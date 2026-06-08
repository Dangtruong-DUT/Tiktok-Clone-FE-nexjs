'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import UpdateProfileForm from './update-profile-form'
import ChangePasswordForm from './change-password-form'
import PrivacySettingsForm from './privacy-settings-form'
import VerifyEmailForm from './verify-email-form'
import { UserSettingsTab, UserSettingsTabType } from '@/constants/ui/settings'

export function SettingsContent() {
    const t = useTranslations('SnapiStudio.settings')
    const [active, setActive] = useState<UserSettingsTabType>(UserSettingsTab.PROFILE)

    const tabs: { id: UserSettingsTabType; label: string }[] = [
        { id: UserSettingsTab.PROFILE, label: t('nav.profile') },
        { id: UserSettingsTab.SECURITY, label: t('nav.security') },
        { id: UserSettingsTab.PRIVACY, label: t('nav.privacy') },
        { id: UserSettingsTab.EMAIL, label: t('nav.email') }
    ]

    return (
        <div className='space-y-6'>
            {/* Horizontal tab bar */}
            <div className='border-b'>
                <div className='flex -mb-px overflow-x-auto scrollbar-hidden'>
                    {tabs.map(({ id, label }) => (
                        <button
                            key={id}
                            type='button'
                            onClick={() => setActive(id)}
                            className={cn(
                                'px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors shrink-0',
                                active === id
                                    ? 'border-brand text-brand'
                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                            )}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab content */}
            <div className='rounded-xl border bg-card p-6 shadow-xs'>
                {active === UserSettingsTab.PROFILE && <UpdateProfileForm />}
                {active === UserSettingsTab.SECURITY && <ChangePasswordForm />}
                {active === UserSettingsTab.PRIVACY && <PrivacySettingsForm />}
                {active === UserSettingsTab.EMAIL && <VerifyEmailForm />}
            </div>
        </div>
    )
}
