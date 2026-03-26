import { NextRequest, NextResponse } from 'next/server'

type RefreshTokenMiddlewareParams = {
    accessToken: string | null | undefined
    refreshToken: string | null | undefined
    pathname: string
    request: NextRequest
    locale: string
}

export function refreshTokenMiddleware({
    accessToken,
    refreshToken,
    pathname,
    request,
    locale
}: RefreshTokenMiddlewareParams) {
    const isAccessTokenValid = !!accessToken
    const isAuthenticated = !!refreshToken

    if (!isAccessTokenValid && isAuthenticated) {
        const url = new URL(`/${locale}/refresh-token`, request.url)
        url.searchParams.set('redirect', pathname)
        return NextResponse.redirect(url)
    }

    return null
}
