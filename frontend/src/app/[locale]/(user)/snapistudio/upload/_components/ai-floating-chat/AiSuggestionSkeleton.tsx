import { Skeleton } from '@/components/ui/skeleton'

export function AiSuggestionSkeleton() {
    return (
        <div className='space-y-4 p-4'>
            {/* Caption tabs skeleton */}
            <div className='flex gap-2'>
                <Skeleton className='h-8 w-20 rounded-full' />
                <Skeleton className='h-8 w-24 rounded-full' />
                <Skeleton className='h-8 w-16 rounded-full' />
            </div>
            {/* Caption text skeleton */}
            <div className='space-y-2'>
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-4 w-5/6' />
                <Skeleton className='h-4 w-4/6' />
            </div>
            {/* Hashtags skeleton */}
            <div className='flex flex-wrap gap-2 pt-2'>
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className='h-6 w-16 rounded-full' />
                ))}
            </div>
            {/* Metadata skeleton */}
            <div className='grid grid-cols-2 gap-3 pt-2'>
                <Skeleton className='h-10 rounded-lg' />
                <Skeleton className='h-10 rounded-lg' />
            </div>
            {/* Apply button skeleton */}
            <Skeleton className='h-9 w-full rounded-lg' />
        </div>
    )
}
