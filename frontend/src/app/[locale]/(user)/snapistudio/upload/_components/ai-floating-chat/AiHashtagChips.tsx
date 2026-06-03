'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

interface AiHashtagChipsProps {
    hashtags: string[]
    /** When provided, chips are toggleable instead of copy-on-click */
    selectedTags?: Set<string>
    onToggle?: (tag: string) => void
    onSelectAll?: () => void
    onDeselectAll?: () => void
}

export function AiHashtagChips({ hashtags, selectedTags, onToggle, onSelectAll, onDeselectAll }: AiHashtagChipsProps) {
    const [copied, setCopied] = useState(false)
    const t = useTranslations('SnapiStudio.aiChat')

    if (!hashtags.length) return null

    const isSelectionMode = selectedTags !== undefined && onToggle !== undefined

    const handleCopyAll = async () => {
        await navigator.clipboard.writeText(hashtags.join(' '))
        setCopied(true)
        toast.success(t('toast.hashtagsCopied'))
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className='space-y-2'>
            <div className='flex items-center justify-between'>
                <span className='text-xs font-medium text-muted-foreground'>
                    {t('hashtags.title')}
                    {isSelectionMode && (
                        <span className='ml-1 text-muted-foreground/60'>
                            {t('hashtags.count', { selected: selectedTags.size, total: hashtags.length })}
                        </span>
                    )}
                </span>

                {isSelectionMode ? (
                    <div className='flex gap-2'>
                        <button type='button' onClick={onSelectAll} className='text-xs text-primary hover:underline'>
                            {t('hashtags.selectAll')}
                        </button>
                        <span className='text-muted-foreground'>·</span>
                        <button
                            type='button'
                            onClick={onDeselectAll}
                            className='text-xs text-muted-foreground hover:text-foreground'
                        >
                            {t('hashtags.deselect')}
                        </button>
                    </div>
                ) : (
                    <button
                        type='button'
                        onClick={handleCopyAll}
                        className='flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors'
                    >
                        {copied ? <Check size={12} className='text-green-500' /> : <Copy size={12} />}
                        {copied ? t('hashtags.copied') : t('hashtags.copyAll')}
                    </button>
                )}
            </div>

            <div className='flex flex-wrap gap-1.5'>
                {hashtags.map((tag) => {
                    const isSelected = isSelectionMode && selectedTags.has(tag)

                    return (
                        <button
                            key={tag}
                            type='button'
                            onClick={async () => {
                                if (isSelectionMode) {
                                    onToggle(tag)
                                } else {
                                    await navigator.clipboard.writeText(tag)
                                    toast.success(t('toast.tagCopied', { tag }))
                                }
                            }}
                            className={cn(
                                'text-xs px-2.5 py-1 rounded-full border transition-all',
                                isSelectionMode
                                    ? isSelected
                                        ? 'bg-primary text-primary-foreground border-primary'
                                        : 'bg-muted/50 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
                                    : 'bg-secondary text-secondary-foreground border-border hover:bg-primary hover:text-primary-foreground hover:border-primary'
                            )}
                        >
                            {tag}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
