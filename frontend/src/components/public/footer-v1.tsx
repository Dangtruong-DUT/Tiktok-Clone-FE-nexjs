import SelectLanguage from '@/components/common/select-language'
import { BRAND_CONFIG } from '@/config/brand.config'
import { cn } from '@/lib/utils'

interface FooterProps {
    classname?: string
    showLanguageSelector?: boolean
}

export default function Footer({ classname, showLanguageSelector = true }: FooterProps) {
    return (
        <footer className={cn('flex items-center justify-between px-4 h-[5.25rem] sm:px-[7rem]  ', classname)}>
            {showLanguageSelector ? <SelectLanguage /> : <div className='w-[150px]' aria-hidden />}
            <strong className='font-semibold text-sm text-neutral-600'>© 2025 {BRAND_CONFIG.APP_NAME}</strong>
        </footer>
    )
}
