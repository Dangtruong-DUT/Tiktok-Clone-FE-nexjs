'use client'

import { Component, ReactNode } from 'react'
import { useTranslations } from 'next-intl'
import SomethingWentWrongIcon from '@/components/lottie-icons/something-went-wrong-icon'
import { logger } from '@/utils/logger.util'

type Translations = {
    title: string
    description: string
    tryAgain: string
}

type InnerProps = {
    children: ReactNode
    fallback?: ReactNode
    t: Translations
}

type State = {
    hasError: boolean
    error: Error | null
}

class ErrorBoundaryInner extends Component<InnerProps, State> {
    constructor(props: InnerProps) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, info: { componentStack: string }) {
        logger.error('[ErrorBoundary]', error, info.componentStack)
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null })
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback

            const { t } = this.props

            return (
                <div className='flex min-h-[400px] flex-col items-center justify-center gap-4 px-4 text-center'>
                    <SomethingWentWrongIcon className='w-56 max-w-full' loop />
                    <div className='space-y-1'>
                        <h2 className='text-xl font-semibold'>{t.title}</h2>
                        <p className='text-muted-foreground text-sm'>{t.description}</p>
                    </div>
                    <button
                        onClick={this.handleReset}
                        className='bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-5 py-2 text-sm font-semibold transition-colors'
                    >
                        {t.tryAgain}
                    </button>
                </div>
            )
        }

        return this.props.children
    }
}

type ErrorBoundaryProps = {
    children: ReactNode
    fallback?: ReactNode
}

export default function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
    const t = useTranslations('errorBoundary')

    return (
        <ErrorBoundaryInner
            t={{ title: t('title'), description: t('description'), tryAgain: t('tryAgain') }}
            fallback={fallback}
        >
            {children}
        </ErrorBoundaryInner>
    )
}
