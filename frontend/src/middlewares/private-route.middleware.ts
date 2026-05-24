import { PROTECTED_ROUTE_PREFIXES } from '@/constants/routes/route-access'
import { AUTH_ROUTES } from '@/constants/routes/routes'
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
        const url = new URL(`/${locale}${AUTH_ROUTES.LOGIN}`, request.url)
        url.searchParams.set('redirect', pathname)
        return NextResponse.redirect(url)
    }

    return null
}
