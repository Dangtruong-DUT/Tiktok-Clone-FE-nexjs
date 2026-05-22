import { guestRouteMiddleware } from '@/middlewares/guest-route.middleware'
import { i18nMiddleware } from '@/middlewares/i18n.middleware'
import { privateRouteMiddleware } from '@/middlewares/private-route.middleware'
import { roleCheckMiddleware } from '@/middlewares/role-check.middleware'
import { getAuthTokens } from '@/utils/auth/token.util'
import { NextRequest } from 'next/server'
import { refreshTokenMiddleware } from './middlewares/auth.middleware'

export function middleware(request: NextRequest) {
    const { response, locale } = i18nMiddleware(request)
    const { pathname } = request.nextUrl

    const { access_token, refresh_token, user_role } = getAuthTokens(request)
    const isAuthenticated = !!refresh_token

    if (pathname.endsWith('/refresh-token')) {
        return response
    }

    const refreshRedirect = refreshTokenMiddleware({
        accessToken: access_token,
        refreshToken: refresh_token,
        pathname,
        request,
        locale
    })
    if (refreshRedirect) return refreshRedirect

    const privateRouteRedirect = privateRouteMiddleware({ pathname, isAuthenticated, request, locale })
    if (privateRouteRedirect) return privateRouteRedirect

    const guestRouteRedirect = guestRouteMiddleware({
        pathname,
        isAuthenticated,
        request,
        userRole: user_role,
        locale
    })
    if (guestRouteRedirect) return guestRouteRedirect

    if (isAuthenticated) {
        const roleRedirect = roleCheckMiddleware({
            userRole: user_role,
            pathname,
            request,
            locale
        })
        if (roleRedirect) return roleRedirect
    }

    return response
}

export const config = {
    matcher: ['/', '/(vi|en)/:path*']
}
