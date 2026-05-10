import { BANNED_ROUTE_PREFIXES, PUBLIC_ROUTE_PREFIXES } from '@/config/route-access.config'
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
    const isBannedRoute = isPathMatched(BANNED_ROUTE_PREFIXES, pathname)
    const isPublicRoute = isPathMatched(PUBLIC_ROUTE_PREFIXES, pathname)
    const isAppealRoute = pathname.endsWith('/appeal')

    if (!isBanned && isBannedRoute) {
        return NextResponse.redirect(new URL(`/${locale}`, request.url))
    }

    if (!isBanned) return null

    if (isBanned && !isPublicRoute && !isBannedRoute && !isAppealRoute) {
        const bannedUntil = payload.ban_until
        const remainingDays = payload.ban_remaining_days

        const targetUrl = new URL(`${locale}/banned`, request.url)
        if (bannedUntil) {
            targetUrl.searchParams.set('ban_until', bannedUntil)
        }
        if (remainingDays !== null) {
            targetUrl.searchParams.set('days', String(remainingDays))
        }

        return NextResponse.redirect(targetUrl)
    }

    return null
}
