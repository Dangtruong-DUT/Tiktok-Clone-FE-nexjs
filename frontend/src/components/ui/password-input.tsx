'use client'

import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    containerClassName?: string
}

export function PasswordInput({ className, containerClassName, ...props }: PasswordInputProps) {
    const [showPassword, setShowPassword] = useState(false)

    return (
        <div className={cn('relative', containerClassName)}>
            <input
                type={showPassword ? 'text' : 'password'}
                data-slot='input'
                className={cn(
                    'border-border placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-11 w-full rounded-xs border bg-muted/50 px-3 pr-10 py-2 text-base transition-colors outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                    'focus-visible:border-ring focus-visible:ring-0 focus-visible:ring-offset-0',
                    'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
                    className
                )}
                {...props}
            />
            <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground flex items-center justify-center'
                tabIndex={-1}
            >
                {showPassword ? <IoEyeOffOutline size={18} /> : <IoEyeOutline size={18} />}
            </button>
        </div>
    )
}
