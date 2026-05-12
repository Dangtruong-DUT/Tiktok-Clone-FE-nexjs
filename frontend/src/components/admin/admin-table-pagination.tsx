'use client'

import { useTranslations } from 'next-intl'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import AutoPagination from '@/components/auto-pagination'
import type { PaginationMeta } from '@/types/common/pagination-meta.type'

interface AdminTablePaginationProps {
    pagination: PaginationMeta
    page: number
    perPage: number
    onPageChange: (page: number) => void
    onPerPageChange: (perPage: number) => void
    perPageOptions?: number[]
}

export function AdminTablePagination({
    pagination,
    page,
    perPage,
    onPageChange,
    onPerPageChange,
    perPageOptions = [5, 10, 25, 50]
}: AdminTablePaginationProps) {
    const t = useTranslations('AdminPage')

    const totalItems = pagination.total ?? 0
    const from = totalItems === 0 ? 0 : (pagination.current_page - 1) * perPage + 1
    const to = Math.min(pagination.current_page * perPage, totalItems)

    return (
        <div className='flex flex-col gap-3 rounded-xl border bg-card px-4 py-3 shadow-xs sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex items-center gap-2.5'>
                <span className='text-xs text-muted-foreground'>{t('common.perPage')}</span>
                <Select value={String(perPage)} onValueChange={(v) => onPerPageChange(Number(v))}>
                    <SelectTrigger className='h-7 w-14 rounded-lg border-border/60 text-xs'>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {perPageOptions.map((opt) => (
                            <SelectItem key={opt} value={String(opt)} className='text-xs'>
                                {opt}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <p className='text-xs text-muted-foreground'>
                {t('common.showingResults', { from, to, total: totalItems })}
            </p>

            {pagination.last_page > 1 && (
                <AutoPagination page={page} pageSize={pagination.last_page} onPageChange={onPageChange} />
            )}
        </div>
    )
}
