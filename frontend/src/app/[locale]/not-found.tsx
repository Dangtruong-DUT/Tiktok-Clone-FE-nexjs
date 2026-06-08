import { useTranslations } from 'next-intl'
import Link from 'next/link'
import NotFoundIcon from '@/components/lottie-icons/not-found-icon'
import { ErrorPagesLayout } from '@/components/common/error-pages-layout'

export const metadata = {
    title: 'Not Found',
    description: 'The page you are looking for does not exist.'
}

export default function NotFound() {
    const t = useTranslations('notFound')
    const headerT = useTranslations('header')

    return (
        <ErrorPagesLayout helpLabel={headerT('help')}>
            <div className='flex flex-col items-center gap-6 px-4 text-center'>
                <NotFoundIcon className='w-72 max-w-full' loop />
                <div className='space-y-2'>
                    <h1 className='text-3xl font-bold tracking-tight'>{t('title')}</h1>
                    <p className='text-muted-foreground max-w-md text-base'>{t('description')}</p>
                </div>
                <Link
                    href='/'
                    className='bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6 py-2.5 text-sm font-semibold transition-colors'
                >
                    {t('backHome')}
                </Link>
            </div>
        </ErrorPagesLayout>
    )
}
