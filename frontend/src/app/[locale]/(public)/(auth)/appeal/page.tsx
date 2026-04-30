import { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { LocalesType } from '@/i18n/config'
import { Suspense } from 'react'
import { AppealFormClient } from './_components/appeal-form-client'

export async function generateMetadata({
    params
}: {
    params: Promise<{ locale: LocalesType }>
}): Promise<Metadata> {
    const { locale } = await params
    setRequestLocale(locale)
    const t = await getTranslations('AppealPage')

    return {
        title: t('meta.title'),
        description: t('meta.description')
    }
}

export default async function PublicAppealPage({
    params,
    searchParams
}: {
    params: Promise<{ locale: LocalesType }>
    searchParams: Promise<{ token?: string; appeal_uuid?: string }>
}) {
    const { locale } = await params
    setRequestLocale(locale)
    const { token, appeal_uuid } = await searchParams

    return (
        <section className='mx-auto flex min-h-[60vh] w-full max-w-2xl items-center justify-center px-4 py-10'>
            <Suspense
                fallback={
                    <div className='w-full animate-pulse space-y-4 rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm'>
                        <div className='h-8 w-3/4 rounded bg-neutral-100' />
                        <div className='h-4 w-1/2 rounded bg-neutral-100' />
                        <div className='mt-6 space-y-3'>
                            <div className='h-12 rounded bg-neutral-100' />
                            <div className='h-32 rounded bg-neutral-100' />
                            <div className='h-24 rounded bg-neutral-100' />
                        </div>
                    </div>
                }
            >
                <AppealFormClient token={token} appealUuid={appeal_uuid} />
            </Suspense>
        </section>
    )
}

