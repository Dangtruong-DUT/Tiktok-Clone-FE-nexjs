import { GUEST_ONLY_ROUTE_PREFIXES } from '@/config/route-access.config'
import { Role } from '@/constants/enum'
import { isPathMatched } from '@/utils/auth/path-check.util'
import { getSafeInternalRedirectPath } from '@/utils/auth/redirect-path.util'
import { JwtPayloadType } from '@/types/common/jwt-payload.type'
import { decodeJwt } from '@/utils/auth/jwt.util'
import { NextRequest, NextResponse } from 'next/server'

type GuestRouteMiddlewareParams = {
    pathname: string
    isAuthenticated: boolean
    request: NextRequest
    refreshToken?: string | null
}

export function guestRouteMiddleware({
    pathname,
    isAuthenticated,
    request,
    refreshToken
}: GuestRouteMiddlewareParams): NextResponse | null {
    const isGuestOnlyPath = isPathMatched(GUEST_ONLY_ROUTE_PREFIXES, pathname)

    if (isGuestOnlyPath && isAuthenticated) {
        const redirectFrom = getSafeInternalRedirectPath(request.nextUrl.searchParams.get('redirect'))
        if (redirectFrom) {
            return NextResponse.redirect(new URL(redirectFrom, request.url))
        }

        const decodedRefreshToken = refreshToken ? decodeJwt<JwtPayloadType>(refreshToken) : null
        const defaultRedirect = decodedRefreshToken?.role === Role.SUPER_ADMIN ? '/admin' : '/'

        return NextResponse.redirect(new URL(defaultRedirect, request.url))
    }

    return null
}
