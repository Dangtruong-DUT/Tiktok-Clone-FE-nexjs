'use client'

import type { CSSProperties } from 'react'
import { useTheme } from 'next-themes'
import { Toaster as Sonner, ToasterProps } from 'sonner'

const Toaster = ({ ...props }: ToasterProps) => {
    const { theme = 'system' } = useTheme()

    return (
        <Sonner
            theme={theme as ToasterProps['theme']}
            className='toaster group'
            style={
                {
                    '--normal-bg': '#3f3f46',
                    '--normal-text': '#f4f4f5',
                    '--normal-border': '#52525b'
                } as CSSProperties
            }
            toastOptions={{
                classNames: {
                    toast: 'rounded-xs! border-0!',
                    description: 'text-xs text-zinc-300',
                    success: 'bg-zinc-600!',
                    error: 'bg-red-600! ',
                    warning: 'bg-amber-400!',
                    info: 'bg-sky-600! '
                }
            }}
            {...props}
        />
    )
}

export { Toaster }
