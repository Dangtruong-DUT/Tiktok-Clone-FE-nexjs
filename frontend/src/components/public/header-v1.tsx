import LogoBrand from '@/components/common/logo-brand'
import { BRAND_CONFIG } from '@/config/brand.config'
import { APP_ROUTES } from '@/constants/routes/routes'
import { cn } from '@/lib/utils'
import { MessageCircleQuestionMark } from 'lucide-react'
import Link from 'next/link'

interface HeaderProps {
    classname?: string
    helpLabel?: string
    useIntlLink?: boolean
    homeHref?: string
}

export default function Header({ classname, helpLabel = 'Help' }: HeaderProps) {
    return (
        <header className={cn('flex items-center justify-between  px-4 h-[3.75rem]', classname)}>
            <Link href={APP_ROUTES.HOME}>
                <LogoBrand className='h-10' />
                <span className='sr-only'>{BRAND_CONFIG.APP_NAME}</span>
            </Link>
            <a
                href='mailto:ndtrg281@gmail.com'
                className='text-sm font-semibold hover:text-neutral-800 flex items-center gap-2'
            >
                <MessageCircleQuestionMark />
                <span className='hover:underline'>{helpLabel}</span>
            </a>
        </header>
    )
}
