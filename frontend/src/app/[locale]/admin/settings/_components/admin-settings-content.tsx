'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { UserCircle, Lock, Shield, Mail } from 'lucide-react'
import UpdateProfileForm from '@/app/[locale]/(user)/snapistudio/settings/_components/update-profile-form'
import ChangePasswordForm from '@/app/[locale]/(user)/snapistudio/settings/_components/change-password-form'
import PrivacySettingsForm from '@/app/[locale]/(user)/snapistudio/settings/_components/privacy-settings-form'
import VerifyEmailForm from '@/app/[locale]/(user)/snapistudio/settings/_components/verify-email-form'
import { AdminSettingsTab, AdminSettingsTabType } from '@/constants/ui/settings'

const TABS: { id: AdminSettingsTabType; icon: React.ElementType; labelKey: string }[] = [
    { id: AdminSettingsTab.PROFILE, icon: UserCircle, labelKey: 'settings.tabs.profile' },
    { id: AdminSettingsTab.SECURITY, icon: Lock, labelKey: 'settings.tabs.security' },
    { id: AdminSettingsTab.PRIVACY, icon: Shield, labelKey: 'settings.tabs.privacy' },
    { id: AdminSettingsTab.EMAIL, icon: Mail, labelKey: 'settings.tabs.email' }
]

export function AdminSettingsContent() {
    const t = useTranslations('AdminPage')
    const [active, setActive] = useState<AdminSettingsTabType>(AdminSettingsTab.PROFILE)

    return (
        <div className='flex flex-col gap-6 lg:flex-row lg:gap-8'>
            <aside className='w-full lg:w-52 shrink-0'>
                <nav className='flex flex-row gap-1 overflow-x-auto lg:flex-col lg:overflow-visible rounded-xl border bg-card p-2 shadow-xs'>
                    {TABS.map(({ id, icon: Icon, labelKey }) => (
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
                            {t(labelKey as Parameters<typeof t>[0])}
                        </button>
                    ))}
                </nav>

                <p className='mt-4 px-1 text-xs text-muted-foreground'>{t('settings.adminNote')}</p>
            </aside>

            <div className='min-w-0 flex-1'>
                <div className='rounded-xl border bg-card p-6 shadow-xs'>
                    {active === AdminSettingsTab.PROFILE && <UpdateProfileForm />}
                    {active === AdminSettingsTab.SECURITY && <ChangePasswordForm />}
                    {active === AdminSettingsTab.PRIVACY && <PrivacySettingsForm />}
                    {active === AdminSettingsTab.EMAIL && <VerifyEmailForm />}
                </div>
            </div>
        </div>
    )
}
