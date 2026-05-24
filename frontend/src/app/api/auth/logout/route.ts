import AuthRequestApi from '@/apis/auth.request'
import { HTTP_STATUS } from '@/constants/api/http-status'
import { AUTH_COOKIE } from '@/constants/auth'
import { deleteAuthCookies, getAuthCookies } from '@/utils/auth/cookies.util'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
    const cookieStore = await cookies()
    const access_token = getAuthCookies(cookieStore, AUTH_COOKIE.ACCESS_TOKEN)
    const refresh_token = getAuthCookies(cookieStore, AUTH_COOKIE.REFRESH_TOKEN)
    deleteAuthCookies(cookieStore)
    if (!access_token || !refresh_token) {
        return NextResponse.json({ message: 'Logout successful.' }, { status: HTTP_STATUS.OK })
    }
    try {
        const response = await AuthRequestApi.logout({
            refresh_token,
            access_token
        })
        return NextResponse.json(response, { status: HTTP_STATUS.OK })
    } catch {
        return NextResponse.json({ message: 'Logout successful.' }, { status: HTTP_STATUS.OK })
    }
}
