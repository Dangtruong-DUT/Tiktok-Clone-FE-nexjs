import { Skeleton } from '@/components/ui/skeleton'

export default function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className='rounded-xl border bg-background shadow-sm overflow-hidden'>
            {/* Header */}
            <div className='grid grid-cols-5 gap-4 bg-muted/40 px-4 py-3 border-b'>
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className='h-4 w-20' />
                ))}
            </div>

            {/* Rows */}
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className='grid grid-cols-5 gap-4 px-4 py-4 border-b last:border-0 items-center'>
                    {/* Content cell with thumbnail */}
                    <div className='flex items-center gap-3'>
                        <Skeleton className='h-[72px] w-[52px] rounded-lg shrink-0' />
                        <div className='space-y-2 flex-1'>
                            <Skeleton className='h-4 w-32' />
                            <Skeleton className='h-3 w-20' />
                        </div>
                    </div>
                    <Skeleton className='h-9 w-[140px] rounded-md' />
                    <Skeleton className='h-4 w-12' />
                    <Skeleton className='h-4 w-12' />
                    <div className='flex gap-1'>
                        <Skeleton className='h-8 w-8 rounded-md' />
                        <Skeleton className='h-8 w-8 rounded-md' />
                    </div>
                </div>
            ))}
        </div>
    )
}
