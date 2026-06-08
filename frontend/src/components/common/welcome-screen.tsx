'use client'

import { useEffect, useState } from 'react'
import { useAppContext } from '@/provider/app-provider'
import { AuthStatus } from '@/constants/status/async'
import WelcomeIcon from '@/components/lottie-icons/welcome-icon'
import { cn } from '@/lib/utils'
import LoadingIcon from '@/components/lottie-icons/loading'

export default function WelcomeScreen() {
    const { authStatus } = useAppContext()
    const [fading, setFading] = useState(false)
    const [gone, setGone] = useState(false)

    useEffect(() => {
        if (authStatus !== AuthStatus.READY) return
        setFading(true)
        const t = setTimeout(() => setGone(true), 600)
        return () => clearTimeout(t)
    }, [authStatus])

    if (gone) return null

    return (
        <div
            className={cn(
                'fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background',
                'transition-opacity duration-[600ms] ease-in-out',
                fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
            )}
        >
            <WelcomeIcon loop={true} className='w-4/5 max-w-[560px]' />

            <div className='mt-6 flex items-center gap-1.5'>
                <LoadingIcon className='size-[3rem]' loop />
            </div>
        </div>
    )
}
