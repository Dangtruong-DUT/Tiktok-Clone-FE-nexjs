'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useLocale, useTranslations } from 'next-intl'
import { LANGUAGES } from '@/i18n/config'
import useLanguage from '@/hooks/shared/useLanguage'
import { cn } from '@/lib/utils'

interface LanguageSelectProps {
    className?: string
    variant?: 'sidebar' | 'default'
}

export function LanguageSelect({ className, variant = 'sidebar' }: LanguageSelectProps) {
    const t = useTranslations('SwitchLanguage')
    const locale = useLocale()
    const { onChange, isPending } = useLanguage()

    return (
        <Select value={locale} onValueChange={onChange} disabled={isPending}>
            <SelectTrigger
                className={cn(
                    variant === 'sidebar'
                        ? 'h-8 border-0 bg-white/5 text-xs text-zinc-400 hover:bg-white/8 hover:text-zinc-200 focus:ring-0 focus:ring-offset-0 transition-colors [&>svg]:text-zinc-500'
                        : 'w-[150px]',
                    className
                )}
            >
                <SelectValue placeholder={t('label')} />
            </SelectTrigger>
            <SelectContent>
                {LANGUAGES.map(({ value, labelKey }) => (
                    <SelectItem key={value} value={value} className={variant === 'sidebar' ? 'text-xs' : undefined}>
                        {t(labelKey as 'en' | 'vi')}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
