import { NextRequest } from 'next/server'
import { locales, LocalesType, HEADER_NAME } from '@/i18n/config'

export function getRequestLocale(request: NextRequest): LocalesType {
    const localeFromHeader = request.headers.get(HEADER_NAME)
    if (localeFromHeader && locales.includes(localeFromHeader as LocalesType)) {
        return localeFromHeader as LocalesType
    }
    return 'en'
}
