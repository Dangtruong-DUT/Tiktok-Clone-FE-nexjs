import LoadingIcon from '@/components/lottie-icons/loading'

export function LoadingScreen() {
    return (
        <div className='w-full rounded-3xl border border-slate-200/80 bg-white p-8 shadow-lg shadow-slate-200/60 md:p-10'>
            <div className='flex flex-col items-center justify-center gap-2 py-12'>
                <LoadingIcon loop className='size-20' />
            </div>
        </div>
    )
}
