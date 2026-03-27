import AuthRequestApi from '@/apis/auth.request'
import { HTTP_STATUS } from '@/constants/http'
import { JwtPayloadType } from '@/types/common/jwt-payload.type'
import { decodeJwt } from '@/utils/auth/jwt.util'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
    const cookieStore = await cookies()
    const refresh_token = cookieStore.get('refresh_token')?.value
    if (!refresh_token) {
        return NextResponse.json(
            { message: 'Your session has expired, please login again.' },
            { status: HTTP_STATUS.UNAUTHORIZED }
        )
    }
    try {
        const response = await AuthRequestApi.refreshToken({
            refresh_token
        })

        const { access_token: newAccessToken, refresh_token: newRefreshToken } = response.data
        const decodedAccessToken = decodeJwt<JwtPayloadType>(newAccessToken)
        const decodedRefreshToken = decodeJwt<JwtPayloadType>(newRefreshToken)

        cookieStore.set('access_token', newAccessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            path: '/',
            expires: new Date(decodedAccessToken.exp! * 1000)
        })
        cookieStore.set('refresh_token', newRefreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            path: '/',
            expires: new Date(decodedRefreshToken.exp! * 1000)
        })
        return NextResponse.json(response, { status: HTTP_STATUS.OK })
    } catch (error) {
        cookieStore.delete('access_token')
        cookieStore.delete('refresh_token')

        return NextResponse.json(
            { message: 'Session expired. Please login again.' },
            { status: HTTP_STATUS.UNAUTHORIZED }
        )
    }
}
