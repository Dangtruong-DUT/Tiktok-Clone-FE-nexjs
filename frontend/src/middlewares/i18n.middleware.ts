import { I18N_HEADER, locales, LocalesType } from '@/i18n/config'
import { getRequestLocale } from '@/utils/i18n.util'
import { NextRequest, NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'

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
