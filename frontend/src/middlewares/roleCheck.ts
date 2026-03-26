import { Role } from '@/constants/enum'
import { superAdminPaths, isPathIncluded, userPaths } from '@/middlewares/pathCheck'
import { JwtPayloadType } from '@/types/common/jwt-payload.type'
import { decodeJwt } from '@/utils/jwt'
import { NextRequest, NextResponse } from 'next/server'

export function handleRoleAccess(refresh_token: string, pathname: string, request: NextRequest): NextResponse | null {
    const { role } = decodeJwt<JwtPayloadType>(refresh_token)

    const isSuperAdminPath = isPathIncluded(superAdminPaths, pathname)

    if (isSuperAdminPath && role !== Role.SUPER_ADMIN) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    return null
}
