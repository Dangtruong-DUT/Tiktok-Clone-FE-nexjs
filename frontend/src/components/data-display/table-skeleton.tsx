import { Skeleton } from '@/components/ui/skeleton'

interface TableSkeletonProps {
    columnWidths?: string[]
    rows?: number
    showToolbar?: boolean
    showPagination?: boolean
}

const DEFAULT_COLUMN_WIDTHS = ['w-8 shrink-0', 'w-28', 'flex-1', 'w-16 rounded-full', 'w-24', 'w-20 ml-auto']

export function TableSkeleton({
    columnWidths = DEFAULT_COLUMN_WIDTHS,
    rows = 7,
    showToolbar = true,
    showPagination = true
}: TableSkeletonProps) {
    return (
        <div className='rounded-xl border bg-card shadow-xs overflow-hidden'>
            {showToolbar && (
                <div className='border-b border-border/50 px-4 py-2.5'>
                    <Skeleton className='h-8 w-full rounded-xl' />
                </div>
            )}
            <div className='divide-y divide-border/40'>
                {showToolbar && (
                    <div className='bg-muted/30 px-4 py-2.5'>
                        <Skeleton className='h-3.5 w-1/2' />
                    </div>
                )}
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className='flex items-center gap-4 px-4 py-3.5'>
                        {columnWidths.map((cls, j) => (
                            <Skeleton key={j} className={`h-3.5 ${cls}`} />
                        ))}
                    </div>
                ))}
            </div>
            {showPagination && (
                <div className='border-t border-border/50 px-4 py-2.5'>
                    <Skeleton className='h-7 w-48' />
                </div>
            )}
        </div>
    )
}
