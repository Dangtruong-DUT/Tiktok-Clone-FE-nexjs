'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { CalendarClock, BookUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import PostTableProvider from '@/app/[locale]/(user)/snapistudio/content/_context/content-table.context'
import TableContent from '@/app/[locale]/(user)/snapistudio/content/_components/table-content'
import ScheduledPostsContent from '@/app/[locale]/(user)/snapistudio/scheduled-posts/_components/ScheduledPostsContent'

type TabKey = 'posts' | 'scheduled'

export default function ContentTabs() {
    const t = useTranslations('SnapiStudio')
    const [activeTab, setActiveTab] = useState<TabKey>('posts')

    const TABS = [
        { key: 'posts'     as const, label: t('navigation.posts'),     icon: BookUp },
        { key: 'scheduled' as const, label: t('navigation.scheduled'), icon: CalendarClock }
    ]

    return (
        <div className='space-y-4'>
            <div className='flex gap-1 border-b border-border px-6 pt-4'>
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

            {activeTab === 'posts' && (
                <div className='px-4 sm:px-6'>
                    <PostTableProvider>
                        <TableContent />
                    </PostTableProvider>
                </div>
            )}

            {activeTab === 'scheduled' && <ScheduledPostsContent />}
        </div>
    )
}
