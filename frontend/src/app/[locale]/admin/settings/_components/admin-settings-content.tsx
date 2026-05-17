'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { UserCircle, Lock } from 'lucide-react'
import UpdateProfileForm from '@/app/[locale]/(user)/snapistudio/settings/_components/update-profile-form'
import ChangePasswordForm from '@/app/[locale]/(user)/snapistudio/settings/_components/change-password-form'

type Tab = 'profile' | 'security'

const TABS: { id: Tab; icon: React.ElementType; label: string }[] = [
    { id: 'profile', icon: UserCircle, label: 'Profile' },
    { id: 'security', icon: Lock, label: 'Security' }
]

export function AdminSettingsContent() {
    const t = useTranslations('AdminPage')
    const [active, setActive] = useState<Tab>('profile')

    return (
        <div className='flex flex-col gap-6 lg:flex-row lg:gap-8'>
            <aside className='w-full lg:w-52 shrink-0'>
                <nav className='flex flex-row gap-1 overflow-x-auto lg:flex-col lg:overflow-visible rounded-xl border bg-card p-2 shadow-xs'>
                    {TABS.map(({ id, icon: Icon, label }) => (
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

                <p className='mt-4 px-1 text-xs text-muted-foreground'>{t('settings.adminNote')}</p>
            </aside>

            <div className='min-w-0 flex-1'>
                <div className='rounded-xl border bg-card p-6 shadow-xs'>
                    {active === 'profile' && <UpdateProfileForm />}
                    {active === 'security' && <ChangePasswordForm />}
                </div>
            </div>
        </div>
    )
}
