import { getTranslations } from 'next-intl/server'
import LoadingIcon from '@/components/lottie-icons/loading'

export async function AdminLoading() {
    const t = await getTranslations('AdminPage')
    return (
        <div className='flex min-h-[60vh] items-center justify-center'>
            <div className='flex flex-col items-center gap-2'>
                <LoadingIcon loop className='size-20' />
                <p className='text-sm text-muted-foreground'>{t('common.loading')}</p>
            </div>
        </div>
    )
}
