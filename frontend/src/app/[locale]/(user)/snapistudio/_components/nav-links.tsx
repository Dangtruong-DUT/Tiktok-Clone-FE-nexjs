'use client'

import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { Link, usePathname } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import SmallLogo from '@/components/common/small-logo'
import { navItems } from '@/app/[locale]/(user)/snapistudio/_config/navItems'
import { APP_ROUTES, SNAPISTUDIO_ROUTES } from '@/constants/routes/routes'
import { VideoProcessingBadge } from '@/components/common/video-processing/VideoProcessingBadge'
import { ArrowLeft, PanelLeftClose, Plus } from 'lucide-react'
import { LanguageSelect } from '@/components/common/language-select'
import { ThemeDropdown } from '@/components/common/theme-dropdown'

interface NavLinksProps {
    collapsed: boolean
    onToggle: () => void
}

export default function NavLinks({ collapsed, onToggle }: NavLinksProps) {
    const t = useTranslations('SnapiStudio.navigation')
    const t2 = useTranslations('StudioLayout')
    const pathname = usePathname()

    const isActive = (href: string) => pathname === href

    return (
        <TooltipProvider delayDuration={0}>
            <aside
                className={cn(
                    'hidden md:flex md:flex-col shrink-0 bg-zinc-900 dark:bg-zinc-950 transition-[width] duration-300 ease-in-out overflow-hidden',
                    collapsed ? 'md:w-14' : 'md:w-60'
                )}
            >
                <div className='flex flex-col h-full'>
                    {/* Logo / Header */}
                    <div
                        className={cn(
                            'shrink-0 flex items-center h-14 border-b border-white/8',
                            collapsed ? 'justify-center' : 'px-4'
                        )}
                    >
                        {collapsed ? (
                            <button
                                onClick={onToggle}
                                className='flex h-8 w-8 items-center justify-center rounded-lg text-white hover:bg-white/10 transition-colors'
                                aria-label='Expand sidebar'
                            >
                                <SmallLogo className='h-6 w-6' />
                            </button>
                        ) : (
                            <div className='flex w-full items-center justify-between'>
                                <Link
                                    href={SNAPISTUDIO_ROUTES.ROOT}
                                    className='group flex min-w-0 items-center gap-2.5'
                                >
                                    <SmallLogo className='h-7 w-7 shrink-0' />
                                    <div className='min-w-0'>
                                        <p className='truncate text-sm font-bold leading-none text-white'>snapi</p>
                                        <p className='mt-[3px] truncate text-[10px] leading-none text-zinc-400'>
                                            Studio
                                        </p>
                                    </div>
                                </Link>
                                <button
                                    onClick={onToggle}
                                    className='ml-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-zinc-500 hover:bg-white/10 hover:text-zinc-200 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]'
                                    aria-label='Collapse sidebar'
                                >
                                    <PanelLeftClose className='h-4 w-4' />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Nav body */}
                    <nav className='flex-1 overflow-y-auto py-3 px-2 space-y-4'>
                        {/* Upload button */}
                        <div>
                            {collapsed ? (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Link
                                            href={SNAPISTUDIO_ROUTES.UPLOAD}
                                            className={cn(
                                                'mb-2 flex h-9 w-full items-center justify-center rounded-xl bg-orange-500 text-white hover:bg-orange-400 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]',
                                                {
                                                    'opacity-40 pointer-events-none': pathname.includes(
                                                        SNAPISTUDIO_ROUTES.UPLOAD
                                                    )
                                                }
                                            )}
                                        >
                                            <Plus className='h-4 w-4' />
                                        </Link>
                                    </TooltipTrigger>
                                    <TooltipContent side='right'>{t2('upload')}</TooltipContent>
                                </Tooltip>
                            ) : (
                                <>
                                    <Link
                                        href={SNAPISTUDIO_ROUTES.UPLOAD}
                                        className={cn({
                                            'pointer-events-none': pathname.includes(SNAPISTUDIO_ROUTES.UPLOAD)
                                        })}
                                    >
                                        <button
                                            disabled={pathname.includes(SNAPISTUDIO_ROUTES.UPLOAD)}
                                            className={cn(
                                                'mb-2 w-full flex items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-semibold',
                                                'bg-orange-500 text-white hover:bg-orange-400 transition-colors',
                                                {
                                                    'opacity-40 cursor-not-allowed': pathname.includes(
                                                        SNAPISTUDIO_ROUTES.UPLOAD
                                                    )
                                                }
                                            )}
                                        >
                                            <Plus className='size-4' />
                                            {t2('upload')}
                                        </button>
                                    </Link>
                                    <VideoProcessingBadge className='px-1' />
                                </>
                            )}
                        </div>

                        {/* Nav items */}
                        <div>
                            {!collapsed && (
                                <p className='mb-1 px-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-zinc-500'>
                                    Manage
                                </p>
                            )}
                            <div className='space-y-0.5'>
                                {navItems.map((item) => {
                                    const active = isActive(item.href)
                                    return collapsed ? (
                                        <Tooltip key={item.href}>
                                            <TooltipTrigger asChild>
                                                <Link
                                                    href={item.href}
                                                    aria-current={active ? 'page' : undefined}
                                                    className={cn(
                                                        'flex h-9 w-full items-center justify-center rounded-xl transition-all duration-300',
                                                        active
                                                            ? 'bg-white/15 text-white'
                                                            : 'text-zinc-400 hover:bg-white/8 hover:text-zinc-200'
                                                    )}
                                                >
                                                    <item.Icon className='h-4 w-4 shrink-0' />
                                                </Link>
                                            </TooltipTrigger>
                                            <TooltipContent side='right'>{t(item.title)}</TooltipContent>
                                        </Tooltip>
                                    ) : (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            aria-current={active ? 'page' : undefined}
                                            className={cn(
                                                'group flex items-center rounded-xl px-2.5 py-2 text-sm font-medium transition-all duration-300',
                                                active
                                                    ? 'bg-white/15 text-white'
                                                    : 'text-zinc-400 hover:bg-white/8 hover:text-zinc-200'
                                            )}
                                        >
                                            <item.Icon
                                                className={cn(
                                                    'mr-2.5 h-4 w-4 shrink-0',
                                                    active ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-200'
                                                )}
                                            />
                                            <span className='truncate flex-1'>{t(item.title)}</span>
                                            {active && (
                                                <span className='ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-white/50' />
                                            )}
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    </nav>

                    {/* Footer */}
                    <div className='shrink-0 border-t border-white/8 px-2 py-3 space-y-0.5'>
                        {collapsed ? (
                            <>
                                <ThemeDropdown collapsed />
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Link
                                            href={APP_ROUTES.HOME}
                                            className='flex h-9 w-full items-center justify-center rounded-xl text-zinc-500 hover:bg-white/8 hover:text-zinc-300 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]'
                                        >
                                            <ArrowLeft className='h-3.5 w-3.5' />
                                        </Link>
                                    </TooltipTrigger>
                                    <TooltipContent side='right' className='text-xs'>
                                        {t('back')}
                                    </TooltipContent>
                                </Tooltip>
                            </>
                        ) : (
                            <>
                                <div className='flex items-center gap-1.5 px-0.5'>
                                    <LanguageSelect className='flex-1' />
                                    <ThemeDropdown />
                                </div>
                                <Link href={APP_ROUTES.HOME}>
                                    <span className='flex items-center rounded-xl px-2.5 py-2 text-sm font-medium text-zinc-500 hover:bg-white/8 hover:text-zinc-300 transition-all duration-300'>
                                        <ArrowLeft className='mr-2.5 h-3.5 w-3.5 shrink-0' />
                                        {t('back')}
                                    </span>
                                </Link>
                                <p className='px-2.5 text-[10px] text-zinc-600'>
                                    © {new Date().getFullYear()} snapi · Studio
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </aside>
        </TooltipProvider>
    )
}
