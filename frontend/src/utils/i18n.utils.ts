import { NextRequest } from 'next/server'
import { locales, LocalesType, I18N_HEADER } from '@/i18n/config'

export function getRequestLocale(request: NextRequest): LocalesType {
    const localeFromHeader = request.headers.get(I18N_HEADER)
    if (localeFromHeader && locales.includes(localeFromHeader as LocalesType)) {
        return localeFromHeader as LocalesType
    }
    return 'en'
}
