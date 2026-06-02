'use client'

import { useState } from 'react'
import { AdminLayout, AdminContainer } from '@/components/admin'
import { ADMIN_ROUTES } from '@/constants/routes/routes'
import { ScheduledPostMetrics } from './_components/ScheduledPostMetrics'
import { ScheduledPostTable }   from './_components/ScheduledPostTable'
import { cn } from '@/lib/utils'
import { BarChart2, List } from 'lucide-react'


const TABS = [
    { key: 'metrics',  label: 'Metrics',  icon: BarChart2 },
    { key: 'requests', label: 'Requests', icon: List },
] as const

type TabKey = (typeof TABS)[number]['key']


export default function AdminScheduledPostsPage() {
    const [activeTab, setActiveTab] = useState<TabKey>('metrics')

    return (
        <AdminLayout
            title='Scheduled Posts'
            description='Monitor, control, and audit all creator-scheduled posts across the platform.'
            breadcrumbs={[{ label: 'Admin', href: ADMIN_ROUTES.DASHBOARD }, { label: 'Scheduled Posts' }]}
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

                {activeTab === 'metrics'  && <ScheduledPostMetrics />}
                {activeTab === 'requests' && <ScheduledPostTable />}
            </AdminContainer>
        </AdminLayout>
    )
}
