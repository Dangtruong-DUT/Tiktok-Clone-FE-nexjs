import { GUEST_ONLY_ROUTE_PREFIXES } from '@/config/route-access.config'
import { isPathMatched } from '@/utils/auth/path-check'
import { getSafeInternalRedirectPath } from '@/utils/auth/redirect-path'
import { NextRequest, NextResponse } from 'next/server'

type GuestRouteMiddlewareParams = {
    pathname: string
    isAuthenticated: boolean
    request: NextRequest
}

export function guestRouteMiddleware({
    pathname,
    isAuthenticated,
    request
}: GuestRouteMiddlewareParams): NextResponse | null {
    const isGuestOnlyPath = isPathMatched(GUEST_ONLY_ROUTE_PREFIXES, pathname)

    if (isGuestOnlyPath && isAuthenticated) {
        const redirectFrom = getSafeInternalRedirectPath(request.nextUrl.searchParams.get('redirect'))
        if (redirectFrom) {
            return NextResponse.redirect(new URL(redirectFrom, request.url))
        }
        return NextResponse.redirect(new URL('/', request.url))
    }

    return null
}
