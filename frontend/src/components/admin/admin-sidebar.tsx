'use client'

import { usePathname } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { ADMIN_ROUTES } from '@/constants/routes/routes'
import { ADMIN_NAV_GROUPS } from '@/constants/admin/navigation'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import SmallLogo from '@/components/common/small-logo'
import { LANGUAGES } from '@/i18n/config'
import useLanguage from '@/hooks/shared/useLanguage'
import { useTheme } from 'next-themes'
import { ArrowLeft, ChevronDown, Monitor, Moon, PanelLeftClose, Sun } from 'lucide-react'
import type { DashboardStats } from '@/types/dtos/admin/admin-response.dto'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

interface AdminSidebarProps {
    collapsed: boolean
    onToggle: () => void
    stats?: DashboardStats
}

export function AdminSidebar({ collapsed, onToggle, stats }: AdminSidebarProps) {
    const pathname = usePathname()
    const t = useTranslations('AdminPage')
    const locale = useLocale()
    const { onChange: onLocaleChange, isPending: isLocalePending } = useLanguage()
    const { setTheme, theme } = useTheme()

    const localizedPath = (route: string) => `/${locale}${route}`
    const isActive = (route: string) =>
        route === ADMIN_ROUTES.DASHBOARD ? pathname === localizedPath(route) : pathname?.includes(localizedPath(route))
    const isChildActive = (item: (typeof ADMIN_NAV_GROUPS)[0]['items'][0]) =>
        item.children?.some((c) => pathname === localizedPath(c.href) || pathname?.startsWith(localizedPath(c.href) + '/')) ?? false

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
                                aria-label={t('shell.expandSidebar')}
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
                                    className='ml-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-zinc-500 hover:bg-white/10 hover:text-zinc-200 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]'
                                    aria-label={t('shell.collapseSidebar')}
                                >
                                    <PanelLeftClose className='h-4 w-4' />
                                </button>
                            </div>
                        )}
                    </div>

                    <nav className='flex-1 overflow-y-auto py-3 px-2 space-y-4'>
                        {ADMIN_NAV_GROUPS.map((group) => (
                            <div key={group.labelKey}>
                                {!collapsed && (
                                    <p className='mb-1 px-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-zinc-500'>
                                        {t(group.labelKey as Parameters<typeof t>[0])}
                                    </p>
                                )}
                                <div className='space-y-0.5'>
                                    {group.items.map((item) => {
                                        const active = isActive(item.href)
                                        const badge = item.badgeKey ? stats?.[item.badgeKey] : undefined
                                        const showBadge = typeof badge === 'number' && badge > 0
                                        const hasChildren = !!item.children?.length

                                        if (collapsed) {
                                            return (
                                                <Tooltip key={item.href}>
                                                    <TooltipTrigger asChild>
                                                        <Link
                                                            href={item.href}
                                                            aria-current={active ? 'page' : undefined}
                                                            className={cn(
                                                                'relative flex h-9 w-full items-center justify-center rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-95',
                                                                active || isChildActive(item)
                                                                    ? 'bg-white/15 text-white'
                                                                    : 'text-zinc-400 hover:bg-white/8 hover:text-zinc-200'
                                                            )}
                                                        >
                                                            <item.icon className='h-4 w-4 shrink-0' />
                                                            {showBadge && (
                                                                <span className='absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-orange-400' />
                                                            )}
                                                        </Link>
                                                    </TooltipTrigger>
                                                    <TooltipContent side='right' className='text-xs'>
                                                        {t(item.titleKey as Parameters<typeof t>[0])}
                                                        {showBadge && ` (${badge})`}
                                                    </TooltipContent>
                                                </Tooltip>
                                            )
                                        }

                                        if (hasChildren) {
                                            const groupActive = isChildActive(item)
                                            return (
                                                <Collapsible key={item.href} defaultOpen={groupActive}>
                                                    <CollapsibleTrigger
                                                        className={cn(
                                                            'group flex w-full items-center rounded-xl px-2.5 py-2 text-sm font-medium transition-all duration-300 hover:scale-[1.02] active:scale-95',
                                                            groupActive
                                                                ? 'text-white'
                                                                : 'text-zinc-400 hover:bg-white/8 hover:text-zinc-200'
                                                        )}
                                                    >
                                                        <item.icon
                                                            className={cn(
                                                                'mr-2.5 h-4 w-4 shrink-0',
                                                                groupActive ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-200'
                                                            )}
                                                        />
                                                        <span className='truncate flex-1'>
                                                            {t(item.titleKey as Parameters<typeof t>[0])}
                                                        </span>
                                                        <ChevronDown className='h-3.5 w-3.5 shrink-0 transition-transform duration-300 group-data-[state=open]:rotate-180' />
                                                    </CollapsibleTrigger>
                                                    <CollapsibleContent>
                                                        <div className='mt-0.5 space-y-0.5'>
                                                            {item.children!.map((child) => {
                                                                const childActive = pathname === localizedPath(child.href)
                                                                return (
                                                                    <Link
                                                                        key={child.href}
                                                                        href={child.href}
                                                                        aria-current={childActive ? 'page' : undefined}
                                                                        className={cn(
                                                                            'group flex items-center rounded-xl pl-9 pr-2.5 py-1.5 text-xs font-medium transition-all duration-300',
                                                                            childActive
                                                                                ? 'bg-white/15 text-white'
                                                                                : 'text-zinc-400 hover:bg-white/8 hover:text-zinc-200'
                                                                        )}
                                                                    >
                                                                        <child.icon
                                                                            className={cn(
                                                                                'mr-2 h-3.5 w-3.5 shrink-0',
                                                                                childActive ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-200'
                                                                            )}
                                                                        />
                                                                        <span className='truncate'>
                                                                            {t(child.titleKey as Parameters<typeof t>[0])}
                                                                        </span>
                                                                        {childActive && (
                                                                            <span className='ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-white/50' />
                                                                        )}
                                                                    </Link>
                                                                )
                                                            })}
                                                        </div>
                                                    </CollapsibleContent>
                                                </Collapsible>
                                            )
                                        }

                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                aria-current={active ? 'page' : undefined}
                                                className={cn(
                                                    'group flex items-center rounded-xl px-2.5 py-2 text-sm font-medium transition-all duration-300 hover:scale-[1.02] active:scale-95',
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
                                                <span className='truncate flex-1'>
                                                    {t(item.titleKey as Parameters<typeof t>[0])}
                                                </span>
                                                {showBadge && (
                                                    <span className='ml-1.5 rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] font-medium leading-none text-zinc-300'>
                                                        {badge}
                                                    </span>
                                                )}
                                                {active && !showBadge && (
                                                    <span className='ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-white/50' />
                                                )}
                                            </Link>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </nav>

                    <div className='shrink-0 border-t border-white/8 px-2 py-3 space-y-0.5'>
                        {collapsed ? (
                            <>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className='flex h-9 w-full items-center justify-center rounded-xl text-zinc-400 hover:bg-white/8 hover:text-zinc-200 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]'>
                                                    <ThemeIcon className='h-4 w-4' />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent side='right' align='end'>
                                                <DropdownMenuItem onClick={() => setTheme('light')}>
                                                    <Sun className='mr-2 h-4 w-4' /> {t('shell.themeLight')}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setTheme('dark')}>
                                                    <Moon className='mr-2 h-4 w-4' /> {t('shell.themeDark')}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setTheme('system')}>
                                                    <Monitor className='mr-2 h-4 w-4' /> {t('shell.themeSystem')}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TooltipTrigger>
                                    <TooltipContent side='right' className='text-xs'>
                                        {t('shell.theme')}
                                    </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Link
                                            href='/'
                                            className='flex h-9 w-full items-center justify-center rounded-xl text-zinc-500 hover:bg-white/8 hover:text-zinc-300 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]'
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
                                                    {labelKey === 'en'
                                                        ? t('shell.language.english')
                                                        : t('shell.language.vietnamese')}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className='flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]'>
                                                <ThemeIcon className='h-3.5 w-3.5' />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent side='top' align='end' className='min-w-[120px]'>
                                            <DropdownMenuItem onClick={() => setTheme('light')} className='text-xs'>
                                                <Sun className='mr-2 h-3.5 w-3.5' /> {t('shell.themeLight')}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setTheme('dark')} className='text-xs'>
                                                <Moon className='mr-2 h-3.5 w-3.5' /> {t('shell.themeDark')}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setTheme('system')} className='text-xs'>
                                                <Monitor className='mr-2 h-3.5 w-3.5' /> {t('shell.themeSystem')}
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
