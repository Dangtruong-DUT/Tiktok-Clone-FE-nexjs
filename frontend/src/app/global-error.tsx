'use client'

import { ErrorPagesLayout } from '@/components/common/error-pages-layout'
import './globals.css'
import { ErrorPageContent } from '@/components/common/error-page-content'

type GlobalErrorProps = {
    error: Error & { digest?: string }
    reset: () => void
}

export default function GlobalError({ reset }: GlobalErrorProps) {
    return (
        <html>
            <body className='h-full'>
                <ErrorPagesLayout helpLabel='Help' showLanguageSelector={false}>
                    <ErrorPageContent
                        title='Something went wrong'
                        description='An unexpected error occurred. Please try again later.'
                        tryAgain='Try again'
                        backHome='Back to Home'
                        onReset={reset}
                    />
                </ErrorPagesLayout>
            </body>
        </html>
    )
}
