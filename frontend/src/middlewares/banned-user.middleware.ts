import { BANNED_ROUTE_PREFIXES, PUBLIC_ROUTE_PREFIXES } from '@/constants/routes/route-access'
import { APP_ROUTES } from '@/constants/routes/routes'
import { JwtPayloadType } from '@/types/common/jwt-payload.type'
import { decodeJwt } from '@/utils/auth/jwt.util'
import { isPathMatched } from '@/utils/auth/path-check.util'
import { NextRequest, NextResponse } from 'next/server'

interface BannedUserMiddlewareParams {
    refreshToken: string
    pathname: string
    request: NextRequest
    locale: string
}

export function bannedUserMiddleware({
    refreshToken,
    pathname,
    request,
    locale
}: BannedUserMiddlewareParams): NextResponse | null {
    const payload = decodeJwt<JwtPayloadType>(refreshToken)
    const isBanned = payload.banned === true

    const routeAccess = getRouteAccess(pathname)

    if (!isBanned) {
        return routeAccess.isBannedRoute ? redirectToHome(request, locale) : null
    }

    if (routeAccess.canBannedUserAccess) {
        return null
    }

    return redirectToBannedPage(request, locale, payload)
}

function getRouteAccess(pathname: string) {
    const isPublicRoute = isPathMatched(PUBLIC_ROUTE_PREFIXES, pathname)
    const isBannedRoute = isPathMatched(BANNED_ROUTE_PREFIXES, pathname)
    const isAppealRoute = pathname.endsWith(APP_ROUTES.APPEAL)
    const isRefreshRoute = pathname.endsWith(APP_ROUTES.TOKEN_REFRESH)

    return {
        isBannedRoute,
        canBannedUserAccess: isPublicRoute || isBannedRoute || isAppealRoute || isRefreshRoute
    }
}

function redirectToHome(request: NextRequest, locale: string) {
    return NextResponse.redirect(new URL(`/${locale}`, request.url))
}

function redirectToBannedPage(request: NextRequest, locale: string, payload: JwtPayloadType) {
    const targetUrl = new URL(`/${locale}${APP_ROUTES.BANNED}`, request.url)

    if (payload.ban_until) {
        targetUrl.searchParams.set('ban_until', payload.ban_until)
    }

    if (payload.ban_remaining_days !== null) {
        targetUrl.searchParams.set('days', String(payload.ban_remaining_days))
    }

    return NextResponse.redirect(targetUrl)
}
