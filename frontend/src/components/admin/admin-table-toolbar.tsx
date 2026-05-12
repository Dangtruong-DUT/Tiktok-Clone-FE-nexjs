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

    const hasFilterRow = !!filters || hasActiveFilters

    return (
        <div className={cn('rounded-xl border bg-card shadow-xs overflow-hidden', className)}>
            {/* ── Search row ── */}
            <div className='flex items-center gap-2 p-3'>
                <div className='relative min-w-0 flex-1'>
                    <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50' />
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={searchPlaceholder}
                        className='h-9 rounded-lg border-transparent bg-muted/40 pl-9 pr-8 transition-colors focus-visible:border-border focus-visible:bg-background focus-visible:ring-0'
                    />
                    {inputValue && (
                        <button
                            type='button'
                            onClick={() => setInputValue('')}
                            aria-label='Clear input'
                            className='absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground/50 transition-colors hover:text-muted-foreground'
                        >
                            <X className='h-3.5 w-3.5' />
                        </button>
                    )}
                </div>

                <Button
                    size='sm'
                    onClick={handleSubmit}
                    disabled={isFetching}
                    className='h-9 shrink-0 rounded-lg bg-brand px-4 text-white shadow-none hover:bg-brand/85 disabled:bg-brand/50'
                >
                    {isFetching ? (
                        <Loader2 className='h-4 w-4 animate-spin' />
                    ) : (
                        <>
                            <Search className='h-3.5 w-3.5' />
                            {t('common.search')}
                        </>
                    )}
                </Button>

                {searchValue && (
                    <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => { setInputValue(''); onSearchChange('') }}
                        disabled={isFetching}
                        className='h-9 shrink-0 rounded-lg text-muted-foreground hover:text-foreground'
                    >
                        <X className='h-3.5 w-3.5' />
                        {t('common.clearSearch')}
                    </Button>
                )}

                {actions && (
                    <div className='ml-1 flex shrink-0 items-center gap-2 border-l border-border/60 pl-3'>
                        {actions}
                    </div>
                )}
            </div>

            {/* ── Filter row ── */}
            {hasFilterRow && (
                <div className='flex flex-wrap items-center gap-2 border-t border-border/60 bg-muted/20 px-3 py-2'>
                    <div className='relative flex items-center text-muted-foreground/70'>
                        <SlidersHorizontal className='h-3.5 w-3.5 shrink-0' />
                        {hasActiveFilters && (
                            <span className='absolute -right-1 -top-1 h-1.5 w-1.5 rounded-full bg-brand' />
                        )}
                    </div>

                    {filters}

                    {hasActiveFilters && onResetFilters && (
                        <button
                            type='button'
                            onClick={onResetFilters}
                            className='ml-1 flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-brand transition-colors hover:bg-brand/8'
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
