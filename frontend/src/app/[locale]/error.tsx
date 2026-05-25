'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { ErrorPageContent } from '@/components/common/error-page-content'
import { ErrorPagesLayout } from '@/components/common/error-pages-layout'

type ErrorPageProps = {
    error: Error & { digest?: string }
    reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
    const t = useTranslations('serverError')
    const headerT = useTranslations('header')

    useEffect(() => {
        console.error('[Server Error]', error)
    }, [error])

    return (
        <ErrorPagesLayout helpLabel={headerT('help')}>
            <ErrorPageContent
                title={t('title')}
                description={t('description')}
                tryAgain={t('tryAgain')}
                backHome={t('backHome')}
                onReset={reset}
            />
        </ErrorPagesLayout>
    )
}
