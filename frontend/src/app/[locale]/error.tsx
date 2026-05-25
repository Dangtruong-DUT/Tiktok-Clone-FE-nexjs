'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import SomethingWentWrongIcon from '@/components/lottie-icons/something-went-wrong-icon'

type ErrorPageProps = {
    error: Error & { digest?: string }
    reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
    const t = useTranslations('serverError')

    useEffect(() => {
        console.error('[Server Error]', error)
    }, [error])

    return (
        <div className='flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center'>
            <SomethingWentWrongIcon className='w-90 max-w-full' loop />
            <div className='space-y-2'>
                <h1 className='text-3xl font-bold tracking-tight'>{t('title')}</h1>
                <p className='text-muted-foreground max-w-md text-base'>{t('description')}</p>
            </div>
            <div className='flex gap-3'>
                <button
                    onClick={reset}
                    className='bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6 py-2.5 text-sm font-semibold transition-colors'
                >
                    {t('tryAgain')}
                </button>
                <Link
                    href='/'
                    className='border-border hover:bg-accent rounded-full border px-6 py-2.5 text-sm font-semibold transition-colors'
                >
                    {t('backHome')}
                </Link>
            </div>
        </div>
    )
}
