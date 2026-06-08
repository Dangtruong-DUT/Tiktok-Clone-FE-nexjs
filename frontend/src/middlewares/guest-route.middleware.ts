import { GUEST_ONLY_ROUTE_PREFIXES } from '@/constants/routes/route-access'
import { Role } from '@/constants/enum'
import { isPathMatched } from '@/utils/auth/path-check.util'
import { getSafeInternalRedirectPath } from '@/utils/auth/redirect-path.util'
import { NextRequest, NextResponse } from 'next/server'
import { LocalesType } from '@/i18n/config'

type GuestRouteMiddlewareParams = {
    pathname: string
    isAuthenticated: boolean
    request: NextRequest
    userRole: string | null | undefined
    locale: LocalesType
}

export function guestRouteMiddleware({
    pathname,
    isAuthenticated,
    request,
    userRole,
    locale
}: GuestRouteMiddlewareParams): NextResponse | null {
    const isGuestOnlyPath = isPathMatched(GUEST_ONLY_ROUTE_PREFIXES, pathname)

    if (isGuestOnlyPath && isAuthenticated) {
        const redirectFrom = getSafeInternalRedirectPath(request.nextUrl.searchParams.get('redirect'))
        if (redirectFrom) {
            return NextResponse.redirect(new URL(redirectFrom, request.url))
        }

        const defaultRedirect = Number(userRole) === Role.SUPER_ADMIN ? 'admin' : ''
        return NextResponse.redirect(new URL(`/${locale}/${defaultRedirect}`, request.url))
    }

    return null
}
