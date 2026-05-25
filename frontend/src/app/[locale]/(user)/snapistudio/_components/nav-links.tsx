'use client'

import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { Link, usePathname } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import LogoBrand from '@/components/common/logo-brand'
import { navItems } from '@/app/[locale]/(user)/snapistudio/_config/navItems'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { APP_ROUTES, SNAPISTUDIO_ROUTES } from '@/constants/routes/routes'

export default function NavLinks() {
    const t = useTranslations('SnapiStudio.navigation')
    const t2 = useTranslations('StudioLayout')
    const pathname = usePathname()
    return (
        <>
            <aside className='hidden w-62 flex-col border-r  lg:flex max-h-screen overflow-hidden'>
                <div className='flex h-17 items-center px-5 border-b'>
                    <Link href={SNAPISTUDIO_ROUTES.ROOT} className='flex items-center gap-1'>
                        <LogoBrand small={false} />
                        <Badge>
                            <span>Studio</span>
                        </Badge>
                    </Link>
                </div>

                <div className='flex flex-col justify-between flex-1 py-4 px-5'>
                    <div className='flex flex-col gap-4'>
                        <Link
                            href={SNAPISTUDIO_ROUTES.UPLOAD}
                            className={cn('mb-4 mt-5', {
                                'select-none opacity-40 cursor-not-allowed': pathname.includes(
                                    SNAPISTUDIO_ROUTES.UPLOAD
                                )
                            })}
                        >
                            <Button
                                size='lg'
                                variant='brand'
                                className={cn('w-full gap-1!', {
                                    'select-none opacity-40 cursor-not-allowed': pathname?.includes(
                                        SNAPISTUDIO_ROUTES.UPLOAD
                                    )
                                })}
                            >
                                <Plus className='size-5' />
                                <span>{t2('upload')}</span>
                            </Button>
                        </Link>
                        <nav className='space-y-2 '>
                            <h2 className='text-sm font-semibold'>Manage</h2>
                            {navItems.map((item) => {
                                const isActive = pathname === item.href
                                return (
                                    <Link key={item.href} href={item.href} className='block'>
                                        <Button
                                            variant='ghost'
                                            className={cn(
                                                'w-full text-sm font-medium transition-colors flex justify-start gap-2',
                                                {
                                                    '  border-2 border-border bg-muted ': isActive
                                                }
                                            )}
                                        >
                                            <item.Icon
                                                className={cn('h-5 w-5', {
                                                    '': isActive
                                                })}
                                            />
                                            {t(item.title)}
                                        </Button>
                                    </Link>
                                )
                            })}
                        </nav>
                    </div>

                    <div>
                        <Link href={APP_ROUTES.HOME}>
                            <Button
                                variant='ghost'
                                className='w-full text-sm font-medium transition-colors flex justify-start gap-2'
                            >
                                <ChevronLeft className='h-5 w-5' />
                                {t('back')}
                            </Button>
                        </Link>
                    </div>
                </div>
            </aside>

            <TooltipProvider>
                <aside className=' w-14 flex-col border-r bg-background sm:flex lg:hidden max-h-screen overflow-hidden'>
                    <nav className='flex flex-col items-center gap-4 px-2 py-4'>
                        <Link href={SNAPISTUDIO_ROUTES.ROOT} className='flex h-8 w-8 items-center justify-center'>
                            <LogoBrand small={true} />
                        </Link>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Link
                                    href={SNAPISTUDIO_ROUTES.UPLOAD}
                                    className={cn('mb-4 mt-5', {
                                        'select-none opacity-40 cursor-not-allowed': pathname?.includes(
                                            SNAPISTUDIO_ROUTES.UPLOAD
                                        )
                                    })}
                                >
                                    <Button
                                        size='icon'
                                        variant='brand'
                                        className={cn({
                                            'select-none opacity-40 cursor-not-allowed': pathname?.includes(
                                                SNAPISTUDIO_ROUTES.UPLOAD
                                            )
                                        })}
                                    >
                                        <Plus className='size-5' />
                                    </Button>
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent side='right'>Upload</TooltipContent>
                        </Tooltip>

                        {navItems.map((item, index) => {
                            const isActive = pathname === item.href
                            return (
                                <Tooltip key={index}>
                                    <TooltipTrigger asChild>
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
                                                {
                                                    '  border-2 border-border bg-muted ': isActive
                                                }
                                            )}
                                        >
                                            <item.Icon className='h-5 w-5' />
                                            <span className='sr-only'>{t(item.title)}</span>
                                        </Link>
                                    </TooltipTrigger>
                                    <TooltipContent side='right'>{t(item.title)}</TooltipContent>
                                </Tooltip>
                            )
                        })}
                    </nav>
                </aside>
            </TooltipProvider>
        </>
    )
}
