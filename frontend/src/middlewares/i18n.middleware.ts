import { I18N_HEADER, locales, LocalesType } from '@/i18n/config'
import { NextRequest, NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'

function getRequestLocale(request: NextRequest): LocalesType {
    const localeFromHeader = request.headers.get(I18N_HEADER)
    if (localeFromHeader && locales.includes(localeFromHeader as LocalesType)) {
        return localeFromHeader as LocalesType
    }
    return 'en'
}

interface I18nMiddlewareResult {
    response: NextResponse
    locale: LocalesType
}

export function i18nMiddleware(request: NextRequest): I18nMiddlewareResult {
    const locale = getRequestLocale(request)
    const handleI18nRouting = createMiddleware({ locales, defaultLocale: locale })

    const response = handleI18nRouting(request)
    response.headers.set(I18N_HEADER, locale)

    return { response, locale }
}
