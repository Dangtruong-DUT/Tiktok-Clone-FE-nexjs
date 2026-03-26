import { NextRequest, NextResponse } from 'next/server'

export function getTokens(request: NextRequest) {
    const access_token = request.cookies.get('access_token')?.value
    const refresh_token = request.cookies.get('refresh_token')?.value
    return { access_token, refresh_token }
}

export function handleInvalidAccessToken(
    access_token: string | null|undefined,
    refresh_token: string | null|undefined,
    pathname: string,
    request: NextRequest,
    locale: string
) {
    const isAccessTokenValid = !!access_token;
    const isAuthenticated = !!refresh_token;

    if (!isAccessTokenValid && isAuthenticated) {
        const url = new URL(`/${locale}/refresh-token`, request.url)
        url.searchParams.set('redirect', pathname)
        url.searchParams.set('refreshToken', refresh_token)
        return NextResponse.redirect(url)
    }

    return null
}
