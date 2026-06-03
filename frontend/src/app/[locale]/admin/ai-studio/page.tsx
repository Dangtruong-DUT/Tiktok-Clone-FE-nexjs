'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { AdminLayout, AdminContainer } from '@/components/admin'
import { ADMIN_ROUTES } from '@/constants/routes/routes'
import { AiStudioMetrics } from './_components/AiStudioMetrics'
import { AiStudioSettings } from './_components/AiStudioSettings'
import { AiStudioRequests } from './_components/AiStudioRequests'
import { cn } from '@/lib/utils'
import { BarChart2, Settings, List } from 'lucide-react'

type TabKey = 'metrics' | 'settings' | 'requests'

export default function AdminAiStudioPage() {
    const t = useTranslations('AdminPage')
    const [activeTab, setActiveTab] = useState<TabKey>('metrics')

    const TABS = [
        { key: 'metrics' as const,  label: t('aiStudio.tabs.metrics'),  icon: BarChart2 },
        { key: 'settings' as const, label: t('aiStudio.tabs.settings'), icon: Settings },
        { key: 'requests' as const, label: t('aiStudio.tabs.requests'), icon: List }
    ]

    return (
        <AdminLayout
            title={t('aiStudio.title')}
            description={t('aiStudio.description')}
            breadcrumbs={[
                { label: t('breadcrumbs.admin'), href: ADMIN_ROUTES.DASHBOARD },
                { label: t('aiStudio.breadcrumb') }
            ]}
        >
            <AdminContainer>
                {/* Tab navigation */}
                <div className='flex gap-1 border-b border-border mb-6'>
                    {TABS.map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key)}
                            className={cn(
                                'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
                                activeTab === key
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                            )}
                        >
                            <Icon size={15} />
                            {label}
                        </button>
                    ))}
                </div>

                {/* Tab panels */}
                {activeTab === 'metrics' && <AiStudioMetrics />}
                {activeTab === 'settings' && <AiStudioSettings />}
                {activeTab === 'requests' && <AiStudioRequests />}
            </AdminContainer>
        </AdminLayout>
    )
}
