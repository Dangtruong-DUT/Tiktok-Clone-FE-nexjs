'use client'

import { ReactNode, useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, Search, X } from 'lucide-react'
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

    return (
        <div className={cn('flex flex-wrap items-center gap-2 px-4 py-3', className)}>
            <div className='relative w-full min-w-0 max-w-md flex-1'>
                <Search className='pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/50' />
                <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={searchPlaceholder}
                    className='pl-9 pr-9'
                />
                <button
                    type='button'
                    onClick={() => {
                        setInputValue('')
                        onSearchChange('')
                    }}
                    disabled={!inputValue}
                    aria-label='Clear'
                    className='absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 transition-colors hover:text-muted-foreground disabled:pointer-events-none disabled:opacity-30'
                >
                    <X className='h-3.5 w-3.5' />
                </button>
            </div>

            {filters}

            <Button size='lg' variant='brand' onClick={handleSubmit} disabled={isFetching} className='shrink-0'>
                {isFetching ? <Loader2 className='h-3.5 w-3.5 animate-spin' /> : <Search className='h-3.5 w-3.5' />}
                <span className='hidden sm:inline ml-1.5'>{t('common.search')}</span>
            </Button>

            {onResetFilters && (
                <Button
                    type='button'
                    variant='outline'
                    size='lg'
                    onClick={onResetFilters}
                    disabled={!hasActiveFilters}
                    className='shrink-0'
                >
                    <X className='h-4 w-4' />
                    {resetLabel}
                </Button>
            )}

            {actions && (
                <div className='flex shrink-0 items-center gap-2 border-l border-border/50 pl-2'>{actions}</div>
            )}
        </div>
    )
}
