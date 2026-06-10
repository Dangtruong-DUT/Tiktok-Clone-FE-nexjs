'use client'

import { ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { useAiCopilotContext } from '../AiCopilotContext'
import type { AiCopilotNavOutput } from '@/types/models/ai-copilot.model'

interface CopilotNavCardProps {
    output: AiCopilotNavOutput
}

export function CopilotNavCard({ output }: CopilotNavCardProps) {
    const t = useTranslations('SnapiStudio.aiCopilot')
    const { closePanel } = useAiCopilotContext()

    if (!output.routes?.length) return null

    return (
        <div className='mt-1.5 rounded-2xl border border-border bg-card overflow-hidden shadow-sm'>
            <div className='px-3.5 py-2.5 border-b border-border'>
                <p className='text-[11px] font-medium text-muted-foreground uppercase tracking-wide'>
                    {t('navCard.title')}
                </p>
            </div>

            <div className='divide-y divide-border'>
                {output.routes.map((route, i) => (
                    <Link
                        key={i}
                        href={route.path}
                        onClick={closePanel}
                        className={cn(
                            'flex items-center justify-between px-3.5 py-2.5 gap-3',
                            'hover:bg-muted/40 transition-colors group'
                        )}
                    >
                        <div className='flex-1 min-w-0'>
                            <p className='text-sm font-medium text-foreground truncate'>{route.label}</p>
                            <p className='text-[11px] text-muted-foreground truncate mt-0.5'>{route.description}</p>
                        </div>
                        <ArrowRight className='size-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0' />
                    </Link>
                ))}
            </div>
        </div>
    )
}
