import { SUPER_ADMIN_ROUTE_PREFIXES, USER_PROTECTED_ROUTE_PREFIXES } from '@/constants/routes/route-access'
import { Role } from '@/constants/enum'
import { ADMIN_ROUTES } from '@/constants/routes/routes'
import { isPathMatched } from '@/utils/auth/path-check.util'
import { NextRequest, NextResponse } from 'next/server'
import { LocalesType } from '@/i18n/config'

type RoleCheckMiddlewareParams = {
    userRole: string | null | undefined
    pathname: string
    request: NextRequest
    locale: LocalesType
}

export function roleCheckMiddleware({
    userRole,
    pathname,
    request,
    locale
}: RoleCheckMiddlewareParams): NextResponse | null {
    const role = Number(userRole)

    const isSuperAdminPath = isPathMatched(SUPER_ADMIN_ROUTE_PREFIXES, pathname)
    const isUserProtectedPath = isPathMatched(USER_PROTECTED_ROUTE_PREFIXES, pathname)

    if (isSuperAdminPath && role !== Role.SUPER_ADMIN) {
        return NextResponse.redirect(new URL(`/${locale}`, request.url))
    }

    if (isUserProtectedPath && role === Role.SUPER_ADMIN) {
        return NextResponse.redirect(new URL(`/${locale}${ADMIN_ROUTES.DASHBOARD}`, request.url))
    }

    return null
}
