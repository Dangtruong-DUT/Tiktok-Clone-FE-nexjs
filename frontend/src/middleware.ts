import { bannedUserMiddleware } from '@/middlewares/banned-user.middleware'
import { guestRouteMiddleware } from '@/middlewares/guest-route.middleware'
import { i18nMiddleware } from '@/middlewares/i18n.middleware'
import { privateRouteMiddleware } from '@/middlewares/private-route.middleware'
import { roleCheckMiddleware } from '@/middlewares/role-check.middleware'
import { getAuthCookies } from '@/utils/auth/cookies.util'
import { NextRequest, NextResponse } from 'next/server'
import { refreshTokenMiddleware } from './middlewares/auth.middleware'

export async function middleware(request: NextRequest) {
    try {
        const { response, locale } = i18nMiddleware(request)
        const { pathname } = request.nextUrl

        const { access_token, refresh_token, user_role } = getAuthCookies(request.cookies)
        const isAuthenticated = !!refresh_token

        const refreshRedirect = await refreshTokenMiddleware({
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

        if (isAuthenticated && refresh_token) {
            const bannedRedirect = bannedUserMiddleware({ refreshToken: refresh_token, pathname, request, locale })
            if (bannedRedirect) return bannedRedirect

            const roleRedirect = roleCheckMiddleware({
                userRole: user_role,
                pathname,
                request,
                locale
            })
            if (roleRedirect) return roleRedirect
        }

        return response
    } catch {
        return NextResponse.next()
    }
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|api|favicon.ico|test|.*\\..*).*)']
}
