import { HEADER_NAME, locales } from '@/i18n/config'
import { NextRequest, NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'

function getRequestLocale(request: NextRequest): (typeof locales)[number] {
    const localeFromHeader = request.headers.get(HEADER_NAME)
    if (localeFromHeader && locales.includes(localeFromHeader as (typeof locales)[number])) {
        return localeFromHeader as (typeof locales)[number]
    }
    return 'en'
}

export function i18nMiddleware(request: NextRequest): { response: NextResponse; locale: (typeof locales)[number] } {
    const locale = getRequestLocale(request)
    const handleI18nRouting = createMiddleware({ locales, defaultLocale: locale })

    const response = handleI18nRouting(request)
    response.headers.set(HEADER_NAME, locale)

    return { response, locale }
}
