import LoadingIcon from '@/components/lottie-icons/loading'

export default function Loading() {
    return (
        <div className='flex min-h-[60vh] items-center justify-center'>
            <LoadingIcon loop className='size-20' />
        </div>
    )
}
