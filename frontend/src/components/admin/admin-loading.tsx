import LoadingIcon from '@/components/lottie-icons/loading'

interface AdminLoadingProps {
    message?: string
}

export function AdminLoading({ message = 'Loading...' }: AdminLoadingProps) {
    return (
        <div className='flex min-h-[60vh] items-center justify-center'>
            <div className='flex flex-col items-center gap-2'>
                <LoadingIcon loop className='size-20' />
                <p className='text-sm text-muted-foreground'>{message}</p>
            </div>
        </div>
    )
}
