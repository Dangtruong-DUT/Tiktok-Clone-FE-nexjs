'use client'

import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import type { AiCopilotStructuredOutput } from '@/types/models/ai-copilot.model'

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
    const [selectedVariant, setSelectedVariant] = useState(0)
    const [selectedHashtags, setSelectedHashtags] = useState<Set<number>>(
        new Set(output.hashtags.map((_, i) => i)),
    )

    const isDone = status === 'accepted' || status === 'rejected'

    const handleAccept = () => {
        const variantValue = output.variants[selectedVariant]?.value ?? ''
        const hashtagStr   = output.hashtags
            .filter((_, i) => selectedHashtags.has(i))
            .join(' ')

        if (output.target_field === 'hashtags') {
            onAccept(messageUuid, 'hashtags', hashtagStr || variantValue)
        } else {
            const combined = hashtagStr ? `${variantValue}\n\n${hashtagStr}` : variantValue
            onAccept(messageUuid, output.target_field, combined)
        }
    }

    const toggleHashtag = (idx: number) => {
        setSelectedHashtags((prev) => {
            const next = new Set(prev)
            next.has(idx) ? next.delete(idx) : next.add(idx)
            return next
        })
    }

    if (isDone) {
        return (
            <div className='flex items-center gap-1.5 text-xs text-muted-foreground mt-1'>
                {status === 'accepted' ? (
                    <>
                        <Check className='size-3 text-green-500' />
                        <span>{t('contentCard.applied')}</span>
                    </>
                ) : (
                    <>
                        <X className='size-3' />
                        <span>{t('contentCard.dismissed')}</span>
                    </>
                )}
            </div>
        )
    }

    return (
        <div className='mt-2 rounded-xl border border-border bg-card p-3 space-y-2.5'>
            {/* Variant tabs */}
            {output.variants.length > 1 && (
                <div className='flex gap-1 flex-wrap'>
                    {output.variants.map((v, i) => (
                        <button
                            key={i}
                            onClick={() => setSelectedVariant(i)}
                            className={cn(
                                'rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
                                selectedVariant === i
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80',
                            )}
                        >
                            {v.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Selected variant text */}
            <p className='text-sm leading-relaxed whitespace-pre-wrap break-words'>
                {output.variants[selectedVariant]?.value ?? ''}
            </p>

            {/* Hashtag chips */}
            {output.hashtags.length > 0 && (
                <div className='flex flex-wrap gap-1'>
                    {output.hashtags.map((tag, i) => (
                        <Badge
                            key={i}
                            variant={selectedHashtags.has(i) ? 'default' : 'secondary'}
                            className='cursor-pointer text-xs'
                            onClick={() => toggleHashtag(i)}
                        >
                            {tag}
                        </Badge>
                    ))}
                </div>
            )}

            {/* Confidence bar */}
            <div className='flex items-center gap-2'>
                <div className='h-1 flex-1 rounded-full bg-muted overflow-hidden'>
                    <div
                        className='h-full bg-primary rounded-full transition-all'
                        style={{ width: `${Math.round(output.confidence * 100)}%` }}
                    />
                </div>
                <span className='text-[10px] text-muted-foreground tabular-nums'>
                    {Math.round(output.confidence * 100)}%
                </span>
            </div>

            {/* Accept / Reject */}
            <div className='flex gap-2'>
                <Button size='sm' className='flex-1 h-7 text-xs' onClick={handleAccept}>
                    <Check className='size-3 mr-1' />
                    {t('contentCard.accept')}
                </Button>
                <Button size='sm' variant='outline' className='flex-1 h-7 text-xs'
                    onClick={() => onReject(messageUuid)}>
                    <X className='size-3 mr-1' />
                    {t('contentCard.reject')}
                </Button>
            </div>
        </div>
    )
}
