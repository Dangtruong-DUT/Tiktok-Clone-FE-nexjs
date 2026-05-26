import { AUTH_ROUTES } from '@/constants/routes/routes'
import { REFRESH_SKIP_ROUTE_PREFIXES } from '@/constants/routes/route-access'
import { isPathMatched } from '@/utils/auth/path-check.util'
import { NextRequest, NextResponse } from 'next/server'

type RefreshTokenMiddlewareParams = {
    accessToken: string | null | undefined
    refreshToken: string | null | undefined
    pathname: string
    request: NextRequest
    locale: string
}

export function refreshTokenMiddleware({
    accessToken,
    refreshToken,
    pathname,
    request,
    locale
}: RefreshTokenMiddlewareParams) {
    // Skip on guest-only routes and the token-refresh page itself to avoid redirect loops.
    if (isPathMatched(REFRESH_SKIP_ROUTE_PREFIXES, pathname)) return null

    if (accessToken || !refreshToken) return null

    const url = new URL(`/${locale}${AUTH_ROUTES.TOKEN_REFRESH}`, request.url)
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
}
