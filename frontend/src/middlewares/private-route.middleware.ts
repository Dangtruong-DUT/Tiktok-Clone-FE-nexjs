import { PROTECTED_ROUTE_PREFIXES } from '@/config/route-access.config'
import { isPathMatched } from '@/utils/auth/path-check.util'
import { NextRequest, NextResponse } from 'next/server'

type PrivateRouteMiddlewareParams = {
    pathname: string
    isAuthenticated: boolean
    request: NextRequest
    locale: string
}

export function privateRouteMiddleware({
    pathname,
    isAuthenticated,
    request,
    locale
}: PrivateRouteMiddlewareParams): NextResponse | null {
    const isProtectedPath = isPathMatched(PROTECTED_ROUTE_PREFIXES, pathname)

    if (isProtectedPath && !isAuthenticated) {
        const url = new URL(`/${locale}/login`, request.url)
        url.searchParams.set('redirect', pathname)
        return NextResponse.redirect(url)
    }

    return null
}
