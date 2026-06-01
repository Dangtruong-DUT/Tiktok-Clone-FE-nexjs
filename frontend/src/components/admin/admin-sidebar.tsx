'use client'

import { usePathname } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { ADMIN_ROUTES } from '@/constants/routes/routes'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import SmallLogo from '@/components/common/small-logo'
import { LANGUAGES } from '@/i18n/config'
import useLanguage from '@/hooks/shared/useLanguage'
import { useTheme } from 'next-themes'
import {
    Activity,
    ArrowLeft,
    Flag,
    LayoutDashboard,
    MessageCircle,
    Monitor,
    Moon,
    PanelLeftClose,
    Settings,
    Sparkles,
    Sun,
    UserRound,
    Video
} from 'lucide-react'

interface NavItem {
    title: string
    href: string
    icon: React.ComponentType<{ className?: string }>
}

interface AdminSidebarProps {
    collapsed: boolean
    onToggle: () => void
}

export function AdminSidebar({ collapsed, onToggle }: AdminSidebarProps) {
    const pathname = usePathname()
    const t = useTranslations('AdminPage')
    const locale = useLocale()
    const { onChange: onLocaleChange, isPending: isLocalePending } = useLanguage()
    const { setTheme, theme } = useTheme()

    const localizedPath = (route: string) => `/${locale}${route}`
    const isActive = (route: string) =>
        route === ADMIN_ROUTES.DASHBOARD ? pathname === localizedPath(route) : pathname?.includes(localizedPath(route))

    const navItems: NavItem[] = [
        { title: t('dashboard.title'), href: ADMIN_ROUTES.DASHBOARD, icon: LayoutDashboard },
        { title: t('users.title'), href: ADMIN_ROUTES.USERS, icon: UserRound },
        { title: t('moderation.title'), href: ADMIN_ROUTES.POSTS, icon: Video },
        { title: t('comments.title'), href: ADMIN_ROUTES.COMMENTS, icon: MessageCircle },
        { title: t('appeals.title'), href: ADMIN_ROUTES.APPEALS, icon: Flag },
        { title: t('activity.title'), href: ADMIN_ROUTES.ACTIVITY, icon: Activity },
        { title: t('settings.title'), href: ADMIN_ROUTES.SETTINGS, icon: Settings },
        { title: 'AI Studio', href: ADMIN_ROUTES.AI_STUDIO, icon: Sparkles }
    ]

    const ThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor

    return (
        <TooltipProvider delayDuration={0}>
            <aside
                className={cn(
                    'hidden md:flex md:flex-col shrink-0 bg-zinc-900 dark:bg-zinc-950 transition-[width] duration-300 ease-in-out overflow-hidden',
                    collapsed ? 'md:w-14' : 'md:w-60'
                )}
            >
                <div className='flex flex-col h-full'>
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
                                <Link href={ADMIN_ROUTES.DASHBOARD} className='group flex min-w-0 items-center gap-2.5'>
                                    <SmallLogo className='h-7 w-7 shrink-0' />
                                    <div className='min-w-0'>
                                        <p className='truncate text-sm font-bold leading-none text-white'>snapi</p>
                                        <p className='mt-[3px] truncate text-[10px] leading-none text-zinc-400'>
                                            {t('shell.panelLabel')}
                                        </p>
                                    </div>
                                </Link>
                                <button
                                    onClick={onToggle}
                                    className='ml-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-zinc-500 hover:bg-white/10 hover:text-zinc-200 transition-colors'
                                    aria-label='Collapse sidebar'
                                >
                                    <PanelLeftClose className='h-4 w-4' />
                                </button>
                            </div>
                        )}
                    </div>

                    <nav className='flex-1 overflow-y-auto py-3 px-2'>
                        {!collapsed && (
                            <p className='mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-zinc-500'>
                                {t('shell.navigation')}
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
                                                    'flex h-9 w-full items-center justify-center rounded-md transition-colors',
                                                    active
                                                        ? 'bg-white/15 text-white'
                                                        : 'text-zinc-400 hover:bg-white/8 hover:text-zinc-200'
                                                )}
                                            >
                                                <item.icon className='h-4 w-4 shrink-0' />
                                            </Link>
                                        </TooltipTrigger>
                                        <TooltipContent side='right' className='text-xs'>
                                            {item.title}
                                        </TooltipContent>
                                    </Tooltip>
                                ) : (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        aria-current={active ? 'page' : undefined}
                                        className={cn(
                                            'group flex items-center rounded-md px-2.5 py-2 text-sm font-medium transition-colors',
                                            active
                                                ? 'bg-white/15 text-white'
                                                : 'text-zinc-400 hover:bg-white/8 hover:text-zinc-200'
                                        )}
                                    >
                                        <item.icon
                                            className={cn(
                                                'mr-2.5 h-4 w-4 shrink-0',
                                                active ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-200'
                                            )}
                                        />
                                        <span className='truncate'>{item.title}</span>
                                        {active && (
                                            <span className='ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-white/50' />
                                        )}
                                    </Link>
                                )
                            })}
                        </div>
                    </nav>

                    <div className='shrink-0 border-t border-white/8 px-2 py-3 space-y-0.5'>
                        {collapsed ? (
                            <>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className='flex h-9 w-full items-center justify-center rounded-md text-zinc-400 hover:bg-white/8 hover:text-zinc-200 transition-colors'>
                                                    <ThemeIcon className='h-4 w-4' />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent side='right' align='end'>
                                                <DropdownMenuItem onClick={() => setTheme('light')}>
                                                    <Sun className='mr-2 h-4 w-4' /> Light
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setTheme('dark')}>
                                                    <Moon className='mr-2 h-4 w-4' /> Dark
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setTheme('system')}>
                                                    <Monitor className='mr-2 h-4 w-4' /> System
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TooltipTrigger>
                                    <TooltipContent side='right' className='text-xs'>
                                        Theme
                                    </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Link
                                            href='/'
                                            className='flex h-9 w-full items-center justify-center rounded-md text-zinc-500 hover:bg-white/8 hover:text-zinc-300 transition-colors'
                                        >
                                            <ArrowLeft className='h-3.5 w-3.5' />
                                        </Link>
                                    </TooltipTrigger>
                                    <TooltipContent side='right' className='text-xs'>
                                        {t('shell.backToSite')}
                                    </TooltipContent>
                                </Tooltip>
                            </>
                        ) : (
                            <>
                                <div className='flex items-center gap-1.5 px-0.5'>
                                    <Select value={locale} onValueChange={onLocaleChange} disabled={isLocalePending}>
                                        <SelectTrigger className='h-8 flex-1 border-0 bg-white/5 text-xs text-zinc-400 hover:bg-white/8 hover:text-zinc-200 focus:ring-0 focus:ring-offset-0 transition-colors [&>svg]:text-zinc-500'>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {LANGUAGES.map(({ value, labelKey }) => (
                                                <SelectItem key={value} value={value} className='text-xs'>
                                                    {labelKey === 'en' ? '🇺🇸 English' : '🇻🇳 Tiếng Việt'}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className='flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200 transition-colors'>
                                                <ThemeIcon className='h-3.5 w-3.5' />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent side='top' align='end' className='min-w-[120px]'>
                                            <DropdownMenuItem onClick={() => setTheme('light')} className='text-xs'>
                                                <Sun className='mr-2 h-3.5 w-3.5' /> Light
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setTheme('dark')} className='text-xs'>
                                                <Moon className='mr-2 h-3.5 w-3.5' /> Dark
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setTheme('system')} className='text-xs'>
                                                <Monitor className='mr-2 h-3.5 w-3.5' /> System
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <p className='px-2.5 text-[10px] text-zinc-600'>
                                    © {new Date().getFullYear()} snapi · v1.0.0
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </aside>
        </TooltipProvider>
    )
}
