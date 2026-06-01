'use client'

import { useState } from 'react'
import { AdminLayout, AdminContainer } from '@/components/admin'
import { ADMIN_ROUTES } from '@/constants/routes/routes'
import { AiStudioMetrics } from './_components/AiStudioMetrics'
import { AiStudioSettings } from './_components/AiStudioSettings'
import { AiStudioRequests } from './_components/AiStudioRequests'
import { cn } from '@/lib/utils'
import { BarChart2, Settings, List } from 'lucide-react'

const TABS = [
    { key: 'metrics', label: 'Metrics', icon: BarChart2 },
    { key: 'settings', label: 'Settings', icon: Settings },
    { key: 'requests', label: 'Requests', icon: List }
] as const

type TabKey = (typeof TABS)[number]['key']

export default function AdminAiStudioPage() {
    const [activeTab, setActiveTab] = useState<TabKey>('metrics')

    return (
        <AdminLayout
            title='AI Content Studio'
            description='Monitor usage, tune Gemini settings, and review all AI generation requests.'
            breadcrumbs={[{ label: 'Admin', href: ADMIN_ROUTES.DASHBOARD }, { label: 'AI Studio' }]}
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
