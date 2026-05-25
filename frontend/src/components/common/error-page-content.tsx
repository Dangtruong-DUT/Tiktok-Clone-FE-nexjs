'use client'

import SomethingWentWrongIcon from '@/components/lottie-icons/something-went-wrong-icon'

type ErrorPageContentProps = {
    title: string
    description: string
    tryAgain: string
    backHome: string
    onReset: () => void
}

export function ErrorPageContent({ title, description, tryAgain, backHome, onReset }: ErrorPageContentProps) {
    return (
        <div className='flex flex-col items-center gap-6 px-4 text-center'>
            <SomethingWentWrongIcon className='w-90 max-w-full' loop />
            <div className='space-y-2'>
                <h1 className='text-3xl font-bold tracking-tight'>{title}</h1>
                <p className='text-muted-foreground max-w-md text-base'>{description}</p>
            </div>
            <div className='flex gap-3'>
                <button
                    onClick={onReset}
                    className='bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6 py-2.5 text-sm font-semibold transition-colors'
                >
                    {tryAgain}
                </button>
                <a
                    href='/'
                    className='border-border hover:bg-accent rounded-full border px-6 py-2.5 text-sm font-semibold transition-colors'
                >
                    {backHome}
                </a>
            </div>
        </div>
    )
}
