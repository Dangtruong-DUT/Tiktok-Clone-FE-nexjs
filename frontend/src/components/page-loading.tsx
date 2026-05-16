import LoadingIcon from '@/components/lottie-icons/loading'

interface PageLoadingProps {
    message?: string
}

export function PageLoading({ message }: PageLoadingProps) {
    return (
        <div className='flex min-h-[60vh] items-center justify-center'>
            <div className='flex flex-col items-center gap-2'>
                <LoadingIcon loop className='size-20' />
                {message && <p className='text-sm text-muted-foreground'>{message}</p>}
            </div>
        </div>
    )
}
