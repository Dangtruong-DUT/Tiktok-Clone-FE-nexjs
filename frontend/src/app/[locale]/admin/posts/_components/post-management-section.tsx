'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ChevronDown, ChevronUp, Calendar } from 'lucide-react'
import { PostManagementMetrics } from './post-management-metrics'
import { PostManagementTable } from './post-management-table'
import { cn } from '@/lib/utils'

const TABS = [
    { key: 'metrics' as const, labelKey: 'posts.managementSection.tabs.metrics' },
    { key: 'requests' as const, labelKey: 'posts.managementSection.tabs.requests' }
]

type TabKey = 'metrics' | 'requests'

export function PostManagementSection() {
    const t = useTranslations('AdminPage')
    const [isOpen, setIsOpen] = useState(false)
    const [activeTab, setActiveTab] = useState<TabKey>('metrics')

    return (
        <div className='rounded-xl border bg-card overflow-hidden'>
            <button
                type='button'
                onClick={() => setIsOpen((v) => !v)}
                className='w-full flex items-center justify-between px-5 py-4 hover:bg-muted/50 transition-colors'
            >
                    <div className='flex items-center gap-2.5'>
                        <div className='flex size-7 items-center justify-center rounded-lg bg-primary/10'>
                            <Calendar size={14} className='text-primary' />
                        </div>
                        <div className='text-left'>
                            <p className='text-sm font-semibold'>{t('posts.managementSection.title')}</p>
                            <p className='text-xs text-muted-foreground'>{t('posts.managementSection.description')}</p>
                        </div>
                    </div>
                {isOpen ? (
                    <ChevronUp className='size-4 text-muted-foreground' />
                ) : (
                    <ChevronDown className='size-4 text-muted-foreground' />
                )}
            </button>

            {isOpen && (
                <div className='border-t'>
                    <div className='flex gap-1 border-b border-border px-5 pt-3'>
                        {TABS.map(({ key, labelKey }) => (
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
                                {t(labelKey as Parameters<typeof t>[0])}
                            </button>
                        ))}
                    </div>

                    <div className='p-5'>
                        {activeTab === 'metrics' && <PostManagementMetrics />}
                        {activeTab === 'requests' && <PostManagementTable />}
                    </div>
                </div>
            )}
        </div>
    )
}
