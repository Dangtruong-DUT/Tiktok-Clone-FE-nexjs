'use client'

import { useState } from 'react'
import { Check, X, Copy, CheckCheck, Hash } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import type { AiCopilotStructuredOutput } from '@/types/models/ai-copilot.model'
import { useAiCopilotContext } from '../AiCopilotContext'

interface CopilotContentCardProps {
    messageUuid: string
    output: AiCopilotStructuredOutput
    status: 'success' | 'accepted' | 'rejected' | 'failed'
    onAccept: (messageUuid: string, field: string, value: string) => void
    onReject: (messageUuid: string) => void
}

export function CopilotContentCard({
    messageUuid,
    output,
    status,
    onAccept,
    onReject,
}: CopilotContentCardProps) {
    const t = useTranslations('SnapiStudio.aiCopilot')
    const { hasFormPatch } = useAiCopilotContext()
    const canApply = hasFormPatch(output.target_field)
    const [selectedVariant, setSelectedVariant] = useState(0)
    const [selectedHashtags, setSelectedHashtags] = useState<Set<number>>(
        new Set(output.hashtags.map((_, i) => i)),
    )
    const [copied, setCopied] = useState(false)

    const isDone = status === 'accepted' || status === 'rejected'

    const currentText = output.variants[selectedVariant]?.value ?? ''
    const selectedTagsArr = output.hashtags.filter((_, i) => selectedHashtags.has(i))

    const handleCopy = async () => {
        const text = selectedTagsArr.length
            ? `${currentText}\n\n${selectedTagsArr.join(' ')}`
            : currentText
        await navigator.clipboard.writeText(text).catch(() => {})
        setCopied(true)
        setTimeout(() => setCopied(false), 1800)
    }

    const handleAccept = () => {
        const hashtagStr = selectedTagsArr.join(' ')
        if (output.target_field === 'hashtags') {
            onAccept(messageUuid, 'hashtags', hashtagStr || currentText)
        } else {
            const combined = hashtagStr ? `${currentText}\n\n${hashtagStr}` : currentText
            onAccept(messageUuid, output.target_field, combined)
        }
    }

    const toggleHashtag = (idx: number) => {
        setSelectedHashtags(prev => {
            const next = new Set(prev)
            next.has(idx) ? next.delete(idx) : next.add(idx)
            return next
        })
    }

    // ── Done state ──────────────────────────────────────────────────────────
    if (isDone) {
        return (
            <div className={cn(
                'flex items-center gap-1.5 text-xs rounded-lg px-2.5 py-1.5 mt-1 w-fit',
                status === 'accepted'
                    ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                    : 'bg-muted text-muted-foreground',
            )}>
                {status === 'accepted'
                    ? <><Check className='size-3' />{t('contentCard.applied')}</>
                    : <><X className='size-3' />{t('contentCard.dismissed')}</>}
            </div>
        )
    }

    return (
        <div className='mt-1.5 rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300'>
            {/* ── Variant selector ──────────────────────────────────────── */}
            {output.variants.length > 1 && (
                <div className='flex gap-0 border-b border-border'>
                    {output.variants.map((v, i) => (
                        <button
                            key={i}
                            onClick={() => setSelectedVariant(i)}
                            className={cn(
                                'flex-1 py-2 text-[11px] font-medium transition-colors relative',
                                selectedVariant === i
                                    ? 'text-primary bg-primary/5'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/40',
                            )}
                        >
                            {v.label}
                            {selectedVariant === i && (
                                <span className='absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full' />
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* ── Content text ──────────────────────────────────────────── */}
            <div className='relative px-3.5 pt-3 pb-2.5 group'>
                <p className='text-sm leading-relaxed text-foreground whitespace-pre-wrap break-words pr-7'>
                    {currentText}
                </p>
                <button
                    onClick={handleCopy}
                    className='absolute top-3 right-3 opacity-0 group-hover:opacity-100
                               transition-opacity p-1 rounded-xl hover:bg-muted text-muted-foreground'
                    title={t('contentCard.copy')}
                >
                    {copied
                        ? <CheckCheck className='size-3.5 text-green-500' />
                        : <Copy className='size-3.5' />}
                </button>
            </div>

            {/* ── Hashtag chips ─────────────────────────────────────────── */}
            {output.hashtags.length > 0 && (
                <div className='px-3.5 pb-3 flex flex-wrap gap-1.5'>
                    {output.hashtags.map((tag, i) => (
                        <button
                            key={i}
                            onClick={() => toggleHashtag(i)}
                            className={cn(
                                'inline-flex items-center gap-0.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium',
                                'border transition-all',
                                selectedHashtags.has(i)
                                    ? 'bg-primary/10 border-primary/30 text-primary'
                                    : 'bg-transparent border-border text-muted-foreground hover:border-primary/30 hover:text-primary/70',
                            )}
                        >
                            <Hash className='size-2.5 opacity-60' />
                            {tag.replace(/^#/, '')}
                        </button>
                    ))}
                </div>
            )}

            {/* ── Actions ──────────────────────────────────────────────── */}
            <div className='flex border-t border-border'>
                <button
                    onClick={() => onReject(messageUuid)}
                    className='flex-none flex items-center justify-center gap-1.5 px-4 py-2.5
                               text-xs font-medium text-muted-foreground
                               hover:bg-muted hover:text-foreground transition-colors border-r border-border'
                >
                    <X className='size-3.5' />
                    {t('contentCard.reject')}
                </button>
                {canApply ? (
                    <button
                        onClick={handleAccept}
                        className='flex-1 flex items-center justify-center gap-1.5 py-2.5
                                   text-xs font-semibold text-primary
                                   hover:bg-primary/5 transition-colors'
                    >
                        <Check className='size-3.5' />
                        {t('contentCard.accept')}
                    </button>
                ) : (
                    <button
                        onClick={handleCopy}
                        className='flex-1 flex items-center justify-center gap-1.5 py-2.5
                                   text-xs font-semibold text-muted-foreground
                                   hover:bg-muted hover:text-foreground transition-colors'
                    >
                        {copied
                            ? <CheckCheck className='size-3.5 text-green-500' />
                            : <Copy className='size-3.5' />}
                        {copied ? t('contentCard.copied') : t('contentCard.copy')}
                    </button>
                )}
            </div>
        </div>
    )
}
