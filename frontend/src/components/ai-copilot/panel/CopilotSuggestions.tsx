'use client'

import { cn } from '@/lib/utils'

interface CopilotSuggestionsProps {
    chips: string[]
    onSelect: (chip: string) => void
    className?: string
}

export function CopilotSuggestions({ chips, onSelect, className }: CopilotSuggestionsProps) {
    if (!chips.length) return null

    return (
        <div className={cn('flex flex-wrap gap-1.5 pt-1', className)}>
            {chips.map((chip) => (
                <button
                    key={chip}
                    onClick={() => onSelect(chip)}
                    className='rounded-full border border-border bg-background text-foreground
                               px-2.5 py-1 text-[11px] font-medium
                               hover:bg-muted hover:border-primary/30
                               transition-all duration-150 active:scale-95
                               truncate max-w-[180px]'
                    title={chip}
                >
                    {chip}
                </button>
            ))}
        </div>
    )
}
