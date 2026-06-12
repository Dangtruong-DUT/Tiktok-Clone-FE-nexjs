'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { useTranslations } from 'next-intl'
import { Monitor, Moon, Sun } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface ThemeDropdownProps {
    collapsed?: boolean
}

export function ThemeDropdown({ collapsed = false }: ThemeDropdownProps) {
    const t = useTranslations('Theme')
    const { setTheme, resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => setMounted(true), [])

    const ThemeIcon = mounted ? (resolvedTheme === 'dark' ? Moon : resolvedTheme === 'light' ? Sun : Monitor) : Monitor

    if (collapsed) {
        return (
            <DropdownMenu>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                            <button className='flex h-9 w-full items-center justify-center rounded-xl text-zinc-400 hover:bg-white/8 hover:text-zinc-200 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]'>
                                <ThemeIcon className='h-4 w-4' />
                            </button>
                        </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent side='right' className='text-xs'>
                        {t('title')}
                    </TooltipContent>
                </Tooltip>
                <DropdownMenuContent side='right' align='end'>
                    <DropdownMenuItem onClick={() => setTheme('light')}>
                        <Sun className='mr-2 h-4 w-4' /> {t('light')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme('dark')}>
                        <Moon className='mr-2 h-4 w-4' /> {t('dark')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme('system')}>
                        <Monitor className='mr-2 h-4 w-4' /> {t('system')}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        )
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className='flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]'>
                    <ThemeIcon className='h-3.5 w-3.5' />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side='top' align='end' className='min-w-[120px]'>
                <DropdownMenuItem onClick={() => setTheme('light')} className='text-xs'>
                    <Sun className='mr-2 h-3.5 w-3.5' /> {t('light')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')} className='text-xs'>
                    <Moon className='mr-2 h-3.5 w-3.5' /> {t('dark')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')} className='text-xs'>
                    <Monitor className='mr-2 h-3.5 w-3.5' /> {t('system')}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
