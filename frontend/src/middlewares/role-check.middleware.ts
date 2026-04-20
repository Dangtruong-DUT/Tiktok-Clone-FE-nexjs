import { SUPER_ADMIN_ROUTE_PREFIXES, USER_PROTECTED_ROUTE_PREFIXES } from '@/config/route-access.config'
import { Role } from '@/constants/enum'
import { isPathMatched } from '@/utils/auth/path-check.util'
import { JwtPayloadType } from '@/types/common/jwt-payload.type'
import { decodeJwt } from '@/utils/auth/jwt.util'
import { NextRequest, NextResponse } from 'next/server'

type RoleCheckMiddlewareParams = {
    refreshToken: string
    pathname: string
    request: NextRequest
}

export function roleCheckMiddleware({
    refreshToken,
    pathname,
    request
}: RoleCheckMiddlewareParams): NextResponse | null {
    const { role } = decodeJwt<JwtPayloadType>(refreshToken)

    const isSuperAdminPath = isPathMatched(SUPER_ADMIN_ROUTE_PREFIXES, pathname)
    const isUserProtectedPath = isPathMatched(USER_PROTECTED_ROUTE_PREFIXES, pathname)

    if (isSuperAdminPath && role !== Role.SUPER_ADMIN) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    if (isUserProtectedPath && role === Role.SUPER_ADMIN) {
        return NextResponse.redirect(new URL('/admin', request.url))
    }

    return null
}
