'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import AutoPagination from '@/components/data-display/auto-pagination'
import type { PaginationMeta } from '@/types/common/pagination-meta.type'

interface TablePaginationProps {
    pagination: PaginationMeta
    page: number
    perPage: number
    onPageChange: (page: number) => void
    onPerPageChange: (perPage: number) => void
    perPageOptions?: number[]
    perPageLabel?: string
    showingResultsFormatter?: (from: number, to: number, total: number) => string
    pathname?: string
}

export function TablePagination({
    pagination,
    page,
    perPage,
    onPageChange,
    onPerPageChange,
    perPageOptions = [10, 20, 50, 100],
    perPageLabel = 'Per page',
    showingResultsFormatter = (from, to, total) => `${from}–${to} of ${total}`,
    pathname
}: TablePaginationProps) {
    const totalItems = pagination.total ?? 0
    const from = totalItems === 0 ? 0 : (pagination.current_page - 1) * perPage + 1
    const to = Math.min(pagination.current_page * perPage, totalItems)

    return (
        <div className='flex items-center gap-3 px-1'>
            <div className='flex items-center gap-1.5 shrink-0'>
                <span className='text-xs text-muted-foreground'>{perPageLabel}</span>
                <Select value={String(perPage)} onValueChange={(v) => onPerPageChange(Number(v))}>
                    <SelectTrigger className='h-7 w-[72px] rounded border-border/60 text-xs'>
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

            <span className='text-xs text-muted-foreground shrink-0'>
                {showingResultsFormatter(from, to, totalItems)}
            </span>

            {pagination.last_page > 1 && (
                <div className='ml-auto'>
                    <AutoPagination
                        page={page}
                        pageSize={pagination.last_page}
                        onPageChange={onPageChange}
                        pathname={pathname}
                    />
                </div>
            )}
        </div>
    )
}
