'use client'

import { ReactNode, useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, Search, SlidersHorizontal, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

interface AdminTableToolbarProps {
    searchValue: string
    onSearchChange: (value: string) => void
    searchPlaceholder?: string
    filters?: ReactNode
    actions?: ReactNode
    hasActiveFilters?: boolean
    onResetFilters?: () => void
    resetLabel?: string
    isFetching?: boolean
    className?: string
}

export function AdminTableToolbar({
    searchValue,
    onSearchChange,
    searchPlaceholder = 'Search…',
    filters,
    actions,
    hasActiveFilters,
    onResetFilters,
    resetLabel = 'Reset',
    isFetching,
    className
}: AdminTableToolbarProps) {
    const t = useTranslations('AdminPage')
    const [inputValue, setInputValue] = useState(searchValue)

    useEffect(() => {
        if (!searchValue) setInputValue('')
    }, [searchValue])

    const handleSubmit = () => onSearchChange(inputValue)
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleSubmit()
    }

    return (
        <div className={cn('flex flex-col', className)}>
            {/* Search row */}
            <div className='flex items-center gap-2 px-4 py-2.5'>
                <div className='relative min-w-0 flex-1'>
                    <Search className='pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/50' />
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={searchPlaceholder}
                        className='h-8 rounded-md border-transparent bg-muted/50 pl-8 pr-8 text-sm transition-colors focus-visible:border-border focus-visible:bg-background focus-visible:ring-0'
                    />
                    {inputValue && (
                        <button
                            type='button'
                            onClick={() => { setInputValue(''); onSearchChange('') }}
                            aria-label='Clear'
                            className='absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 transition-colors hover:text-muted-foreground'
                        >
                            <X className='h-3.5 w-3.5' />
                        </button>
                    )}
                </div>

                <Button
                    size='sm'
                    onClick={handleSubmit}
                    disabled={isFetching}
                    className='h-8 shrink-0 rounded-md bg-primary px-3 text-xs text-primary-foreground shadow-none hover:bg-primary/85 disabled:opacity-50'
                >
                    {isFetching ? (
                        <Loader2 className='h-3.5 w-3.5 animate-spin' />
                    ) : (
                        <Search className='h-3.5 w-3.5' />
                    )}
                    <span className='hidden sm:inline ml-1.5'>{t('common.search')}</span>
                </Button>

                {actions && (
                    <div className='flex shrink-0 items-center gap-2 border-l border-border/50 pl-2'>
                        {actions}
                    </div>
                )}
            </div>

            {/* Filter row */}
            {(filters || hasActiveFilters) && (
                <div className='flex flex-wrap items-center gap-2 border-t border-border/50 bg-muted/20 px-4 py-2'>
                    <SlidersHorizontal className='h-3.5 w-3.5 shrink-0 text-muted-foreground/60' />
                    {filters}
                    {hasActiveFilters && onResetFilters && (
                        <button
                            type='button'
                            onClick={onResetFilters}
                            className='ml-auto flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/8'
                        >
                            <X className='h-3 w-3' />
                            {resetLabel}
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}
