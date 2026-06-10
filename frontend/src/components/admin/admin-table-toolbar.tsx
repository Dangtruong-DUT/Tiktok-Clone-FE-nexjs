'use client'

import { ReactNode, useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import LoadingIcon from '@/components/lottie-icons/loading'
import { Search, X } from 'lucide-react'
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
    searchPlaceholder,
    filters,
    actions,
    hasActiveFilters,
    onResetFilters,
    resetLabel,
    isFetching,
    className
}: AdminTableToolbarProps) {
    const t = useTranslations('AdminPage')
    const [inputValue, setInputValue] = useState(searchValue)
    const searchPlaceholderText = searchPlaceholder ?? t('common.search')
    const resetLabelText = resetLabel ?? t('common.reset')

    useEffect(() => {
        setInputValue(searchValue)
    }, [searchValue])

    const handleSubmit = () => onSearchChange(inputValue)

    return (
        <div className={cn('flex flex-wrap items-center gap-2', className)}>
            <div className='relative w-full min-w-0 max-w-md flex-1'>
                <Search className='pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/50' />
                <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    placeholder={searchPlaceholderText}
                    className='rounded-none pl-9 pr-9'
                />
                <button
                    type='button'
                    onClick={() => {
                        setInputValue('')
                        onSearchChange('')
                    }}
                    disabled={!inputValue}
                    aria-label={t('common.clearSearch')}
                    className='absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 transition-colors hover:text-muted-foreground disabled:pointer-events-none disabled:opacity-30'
                >
                    <X className='h-3.5 w-3.5' />
                </button>
            </div>

            {filters}

            <Button
                size='lg'
                variant='brand'
                onClick={handleSubmit}
                disabled={isFetching}
                className='shrink-0 rounded-none'
            >
                {isFetching ? <LoadingIcon loop className='size-4' /> : <Search className='h-3.5 w-3.5' />}
                <span className='hidden sm:inline'>{t('common.search')}</span>
            </Button>

            {onResetFilters && (
                <button
                    type='button'
                    onClick={onResetFilters}
                    disabled={!hasActiveFilters}
                    className='flex h-11 shrink-0 items-center gap-1.5 border border-border/60 px-3 text-sm text-muted-foreground transition-colors hover:border-border hover:text-foreground disabled:pointer-events-none disabled:opacity-30'
                >
                    <X className='h-3.5 w-3.5' />
                    {resetLabelText}
                </button>
            )}

            {actions && (
                <div className='flex shrink-0 items-center gap-2 border-l border-border/50 pl-2'>{actions}</div>
            )}
        </div>
    )
}
