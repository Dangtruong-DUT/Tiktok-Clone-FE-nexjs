'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { AiContentSuggestionType } from '@/types/models/ai-content-suggestion.model'
import { useTranslations } from 'next-intl'

const TABS = [
    { key: 'short', labelKey: 'tabs.short', field: 'short_caption' as const },
    { key: 'professional', labelKey: 'tabs.professional', field: 'professional_caption' as const },
    { key: 'viral', labelKey: 'tabs.viral', field: 'viral_caption' as const }
] as const

type TabKey = (typeof TABS)[number]['key']

interface AiCaptionTabsProps {
    suggestion: AiContentSuggestionType
    /** Called when active caption changes (tab switch) */
    onSelect?: (caption: string) => void
}

export function AiCaptionTabs({ suggestion, onSelect }: AiCaptionTabsProps) {
    const [activeTab, setActiveTab] = useState<TabKey>('short')
    const [copiedTab, setCopiedTab] = useState<TabKey | null>(null)
    const t = useTranslations('SnapiStudio.aiChat')

    const currentTab = TABS.find((t) => t.key === activeTab)!
    const caption = suggestion[currentTab.field] ?? ''

    const handleTabChange = (key: TabKey) => {
        const tab = TABS.find((t) => t.key === key)!
        const newCaption = suggestion[tab.field] ?? ''
        setActiveTab(key)
        onSelect?.(newCaption)
    }

    const handleCopy = async () => {
        if (!caption) return
        await navigator.clipboard.writeText(caption)
        setCopiedTab(activeTab)
        toast.success(t('toast.captionCopied'))
        setTimeout(() => setCopiedTab(null), 2000)
    }

    return (
        <div className='space-y-3'>
            {/* Tab switcher */}
            <div className='flex gap-1 bg-muted rounded-lg p-1'>
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        type='button'
                        onClick={() => handleTabChange(tab.key)}
                        className={cn(
                            'flex-1 text-xs font-medium py-1.5 px-2 rounded-md transition-all',
                            activeTab === tab.key
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                        )}
                    >
                        {t(tab.labelKey)}
                    </button>
                ))}
            </div>

            {/* Caption display */}
            <div className='relative rounded-lg bg-muted/50 border border-border p-3 min-h-[72px]'>
                <p className='text-sm leading-relaxed pr-8 whitespace-pre-wrap'>
                    {caption || <span className='text-muted-foreground italic text-xs'>{t('caption.empty')}</span>}
                </p>

                {caption && (
                    <button
                        type='button'
                        onClick={handleCopy}
                        className='absolute top-2 right-2 p-1.5 rounded-md hover:bg-background transition-colors text-muted-foreground hover:text-foreground'
                    >
                        {copiedTab === activeTab ? <Check size={14} className='text-green-500' /> : <Copy size={14} />}
                    </button>
                )}

                {caption && (
                    <span className='mt-2 block text-xs text-muted-foreground'>
                        {t('caption.chars', { count: caption.length })}
                    </span>
                )}
            </div>
        </div>
    )
}
