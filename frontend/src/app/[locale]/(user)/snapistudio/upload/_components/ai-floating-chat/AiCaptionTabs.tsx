'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { AiContentSuggestionType } from '@/types/models/ai-content-suggestion.model'

const TABS = [
    { key: 'short', label: 'Short', field: 'short_caption' as const },
    { key: 'professional', label: 'Professional', field: 'professional_caption' as const },
    { key: 'viral', label: 'Viral', field: 'viral_caption' as const }
]

interface AiCaptionTabsProps {
    suggestion: AiContentSuggestionType
    onSelect?: (caption: string) => void
}

export function AiCaptionTabs({ suggestion, onSelect }: AiCaptionTabsProps) {
    const [activeTab, setActiveTab] = useState<'short' | 'professional' | 'viral'>('short')
    const [copiedTab, setCopiedTab] = useState<string | null>(null)

    const currentTab = TABS.find((t) => t.key === activeTab)!
    const caption = suggestion[currentTab.field] ?? ''

    const handleCopy = async () => {
        if (!caption) return
        await navigator.clipboard.writeText(caption)
        setCopiedTab(activeTab)
        toast.success('Caption copied!')
        setTimeout(() => setCopiedTab(null), 2000)
    }

    return (
        <div className='space-y-3'>
            {/* Tab header */}
            <div className='flex gap-1 bg-muted rounded-lg p-1'>
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        type='button'
                        onClick={() => setActiveTab(tab.key as typeof activeTab)}
                        className={cn(
                            'flex-1 text-xs font-medium py-1.5 px-2 rounded-md transition-all',
                            activeTab === tab.key
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Caption display */}
            <div className='relative rounded-lg bg-muted/50 border border-border p-3 min-h-[80px]'>
                <p className='text-sm leading-relaxed pr-8 whitespace-pre-wrap'>
                    {caption || <span className='text-muted-foreground italic'>No caption generated</span>}
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
                    <div className='flex items-center justify-between mt-2'>
                        <span className='text-xs text-muted-foreground'>{caption.length} chars</span>
                        {onSelect && (
                            <button
                                type='button'
                                onClick={() => {
                                    onSelect(caption)
                                    toast.success('Caption inserted into description!')
                                }}
                                className='text-xs text-primary hover:underline font-medium'
                            >
                                Use this
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
