import AuthRequestApi from '@/apis/auth.request'
import { AUTH_COOKIE } from '@/constants/auth'
import { AUTH_ROUTES } from '@/constants/routes/routes'
import { GUEST_ONLY_ROUTE_PREFIXES } from '@/constants/routes/route-access'
import { isPathMatched } from '@/utils/auth/path-check.util'
import { setAuthCookies } from '@/utils/auth/cookies.util'
import { NextRequest, NextResponse } from 'next/server'

type RefreshTokenMiddlewareParams = {
    accessToken: string | null | undefined
    refreshToken: string | null | undefined
    pathname: string
    request: NextRequest
    locale: string
}

export async function refreshTokenMiddleware({
    accessToken,
    refreshToken,
    pathname,
    request,
    locale
}: RefreshTokenMiddlewareParams) {
    // Skip refresh on guest-only routes (login, signup, etc.) — a failed refresh
    // would redirect back to the same page, causing an infinite redirect loop.
    if (isPathMatched(GUEST_ONLY_ROUTE_PREFIXES, pathname)) return null

    if (accessToken || !refreshToken) return null

    try {
        const { data } = await AuthRequestApi.refreshToken({ refresh_token: refreshToken })
        const {
            access_token: newAccessToken,
            refresh_token: newRefreshToken,
            user: { role: userRole }
        } = data

        const requestHeaders = new Headers(request.headers)
        const updatedCookie = (requestHeaders.get('cookie') ?? '')
            .split('; ')
            .filter((c) => !c.startsWith(`${AUTH_COOKIE.ACCESS_TOKEN}=`))
            .concat(`${AUTH_COOKIE.ACCESS_TOKEN}=${newAccessToken}`)
            .join('; ')
        requestHeaders.set('cookie', updatedCookie)

        const response = NextResponse.next({ request: { headers: requestHeaders } })
        setAuthCookies(response.cookies, {
            access_token: newAccessToken,
            refresh_token: newRefreshToken,
            user_role: userRole
        })

        return response
    } catch {
        const url = new URL(`/${locale}${AUTH_ROUTES.LOGIN}`, request.url)
        url.searchParams.set('redirect', pathname)
        return NextResponse.redirect(url)
    }
}
