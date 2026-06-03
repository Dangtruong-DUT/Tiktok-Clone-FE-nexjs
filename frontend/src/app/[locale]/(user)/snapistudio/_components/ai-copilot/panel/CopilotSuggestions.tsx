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
        <div className={cn('flex flex-wrap gap-1.5 px-3 pt-1 pb-2', className)}>
            {chips.map((chip) => (
                <button
                    key={chip}
                    onClick={() => onSelect(chip)}
                    className='rounded-full border border-border bg-background px-2.5 py-1 text-xs text-foreground
                               hover:bg-muted transition-colors cursor-pointer truncate max-w-[160px]'
                    title={chip}
                >
                    {chip}
                </button>
            ))}
        </div>
    )
}
