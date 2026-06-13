'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { AdminLayout, AdminContainer } from '@/components/admin'
import { AI_STUDIO_TABS, type AiStudioTabKey } from '@/constants/admin/ai'
import { ADMIN_ROUTES } from '@/constants/routes/routes'
import { cn } from '@/lib/utils'
import { BarChart2, Settings, List } from 'lucide-react'
import { AiStudioMetrics } from '../_components/AiStudioMetrics'
import { AiStudioSettings } from '../_components/AiStudioSettings'
import { AiStudioRequests } from '../_components/AiStudioRequests'

export default function AdminAiStudioPage() {
    const t = useTranslations('AdminPage')
    const [activeTab, setActiveTab] = useState<AiStudioTabKey>(AI_STUDIO_TABS.METRICS)

    const TABS = [
        { key: AI_STUDIO_TABS.METRICS, label: t('aiStudio.tabs.metrics'), icon: BarChart2 },
        { key: AI_STUDIO_TABS.SETTINGS, label: t('aiStudio.tabs.settings'), icon: Settings },
        { key: AI_STUDIO_TABS.REQUESTS, label: t('aiStudio.tabs.requests'), icon: List }
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

                {activeTab === AI_STUDIO_TABS.METRICS && <AiStudioMetrics />}
                {activeTab === AI_STUDIO_TABS.SETTINGS && <AiStudioSettings />}
                {activeTab === AI_STUDIO_TABS.REQUESTS && <AiStudioRequests />}
            </AdminContainer>
        </AdminLayout>
    )
}
