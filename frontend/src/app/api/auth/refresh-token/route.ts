import AuthRequestApi from '@/apis/auth.request'
import { HTTP_STATUS } from '@/constants/api/http-status'
import { BffAuthUserResponse } from '@/types/dtos/auth/auth-response.dto'
import { AUTH_COOKIE } from '@/constants/auth'
import { deleteAuthCookies, getAuthCookies, setAuthCookies } from '@/utils/auth/cookies.util'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
    const cookieStore = await cookies()
    const refresh_token = getAuthCookies(cookieStore, AUTH_COOKIE.REFRESH_TOKEN)

    if (!refresh_token) {
        return NextResponse.json(
            { message: 'Your session has expired, please login again.' },
            { status: HTTP_STATUS.UNAUTHORIZED }
        )
    }

    try {
        const response = await AuthRequestApi.refreshToken({ refresh_token })
        const { access_token, refresh_token: newRefreshToken, user } = response.data
        setAuthCookies(cookieStore, { access_token, refresh_token: newRefreshToken, user_role: user.role })

        const bffResponse: BffAuthUserResponse = {
            status: response.status,
            message: response.message,
            data: { user: response.data.user }
        }
        return NextResponse.json(bffResponse, { status: HTTP_STATUS.OK })
    } catch {
        deleteAuthCookies(cookieStore)
        return NextResponse.json(
            { message: 'Session expired. Please login again.' },
            { status: HTTP_STATUS.UNAUTHORIZED }
        )
    }
}
