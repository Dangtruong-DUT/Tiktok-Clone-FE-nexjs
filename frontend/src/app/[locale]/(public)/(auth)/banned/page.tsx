import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { LocalesType } from '@/i18n/config'
import { AlertTriangle, Scale } from 'lucide-react'

type BannedPageProps = {
    params: Promise<{ locale: LocalesType }>
    searchParams: Promise<{ days?: string }>
}

export async function generateMetadata({ params }: { params: Promise<{ locale: LocalesType }> }): Promise<Metadata> {
    const { locale } = await params
    const t = await getTranslations('BannedPage')

    return {
        title: t('title'),
        description: t('description'),
        alternates: {
            canonical: `/${locale}/banned`
        }
    }
}

export default async function BannedPage({ searchParams }: BannedPageProps) {
    const t = await getTranslations('BannedPage')
    const { days } = await searchParams

    const parsedDays = Number(days)
    const remainingDays = Number.isFinite(parsedDays) ? Math.max(0, Math.ceil(parsedDays)) : null

    return (
        <section className='mx-auto flex min-h-[60vh] w-full max-w-3xl items-center justify-center px-4 py-10'>
            <div className='w-full rounded-3xl border border-red-200 bg-white p-6 shadow-sm md:p-10'>
                <div className='mb-6 flex items-center gap-3'>
                    <div className='rounded-full bg-red-100 p-3 text-red-600'>
                        <AlertTriangle className='h-6 w-6' />
                    </div>
                    <div>
                        <h1 className='text-2xl font-bold text-black md:text-3xl'>{t('title')}</h1>
                        <p className='text-sm text-neutral-600 md:text-base'>{t('description')}</p>
                    </div>
                </div>

                <div className='rounded-2xl bg-neutral-50 p-4 md:p-5'>
                    <p className='text-sm text-neutral-700 md:text-base'>
                        {remainingDays !== null ? t('lockWithDays', { days: remainingDays }) : t('lockWithoutDays')}
                    </p>
                </div>

                <div className='mt-6 flex flex-wrap items-center gap-3'>
                    <Link
                        href='/appeal?appeal_type=user_ban&resource_type=user'
                        className='inline-flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800'
                    >
                        <Scale className='h-4 w-4' />
                        {t('appealAction')}
                    </Link>
                    <Link
                        href='/'
                        className='inline-flex items-center rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100'
                    >
                        {t('backHome')}
                    </Link>
                </div>
            </div>
        </section>
    )
}
