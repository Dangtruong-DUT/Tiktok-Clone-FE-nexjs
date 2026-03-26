import { locales } from '@/i18n/config'
import { guestRouteMiddleware } from '@/middlewares/guest-route.middleware'
import { i18nMiddleware } from '@/middlewares/i18n.middleware'
import { privateRouteMiddleware } from '@/middlewares/private-rout.middleware'
import { roleCheckMiddleware } from '@/middlewares/role-check.middleware'
import { getAuthTokens } from '@/utils/auth/token'
import { NextRequest } from 'next/server'
import { refreshTokenMiddleware } from './middlewares/auth.middleware'

export function middleware(request: NextRequest) {
    const { response, locale } = i18nMiddleware(request)
    const { pathname } = request.nextUrl

    const { access_token, refresh_token } = getAuthTokens(request)
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

    const guestRouteRedirect = guestRouteMiddleware({ pathname, isAuthenticated, request })
    if (guestRouteRedirect) return guestRouteRedirect

    if (isAuthenticated) {
        const roleRedirect = roleCheckMiddleware({ refreshToken: refresh_token!, pathname, request })
        if (roleRedirect) return roleRedirect
    }

    return response
}

export const config = {
    matcher: ['/', '/(vi|en)/:path*']
}
