import AuthRequestApi from '@/apis/auth.request'
import { HTTP_STATUS } from '@/constants/http'
import { decodeJwt } from '@/utils/auth/jwt.util'
import { VerifyEmailReqBodyType } from '@/types/dtos/user/user-request.dto'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { JwtPayloadType } from '@/types/common/jwt-payload.type'

export async function POST(request: NextRequest) {
    const body = (await request.json()) as VerifyEmailReqBodyType
    const cookieStore = await cookies()
    try {
        const { email_verify_token } = body
        if (!email_verify_token) {
            throw new Error('Missing email verify token')
        }
        const response = await AuthRequestApi.verifyEmail(body)
        const { access_token, refresh_token } = response.data

        const decodedAccessToken = decodeJwt<JwtPayloadType>(access_token)
        const decodedRefreshToken = decodeJwt<JwtPayloadType>(refresh_token)

        cookieStore.set('access_token', access_token, {
            httpOnly: true,
            sameSite: 'lax',
            expires: new Date(decodedAccessToken.exp! * 1000),
            secure: true,
            path: '/'
        })
        cookieStore.set('refresh_token', refresh_token, {
            httpOnly: true,
            sameSite: 'lax',
            expires: new Date(decodedRefreshToken.exp! * 1000),
            secure: true,
            path: '/'
        })

        return NextResponse.json(response)
    } catch (error) {
        console.error('Error verifying email:', error)
        return NextResponse.json(
            { message: 'Please provide a valid email verify token.' },
            { status: HTTP_STATUS.BAD_REQUEST }
        )
    }
}
