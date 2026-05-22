import AuthRequestApi from '@/apis/auth.request'
import { HTTP_STATUS } from '@/constants/api/http-status'
import { decodeJwt } from '@/utils/auth/jwt.util'
import { JwtPayloadType } from '@/types/common/jwt-payload.type'
import { VerifyEmailReqBodyType } from '@/types/dtos/user/user-request.dto'
import { VerifyEmailResType } from '@/types/dtos/user/user-response.dto'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/utils/logger'

export async function POST(request: NextRequest) {
    const body = (await request.json()) as VerifyEmailReqBodyType
    const cookieStore = await cookies()
    try {
        const { email_verify_token } = body
        if (!email_verify_token) {
            throw new Error('Missing email verify token')
        }

        const response = await AuthRequestApi.verifyEmail(body)
        const { access_token, refresh_token, user } = response.data
        const decodedAccess = decodeJwt<JwtPayloadType>(access_token)
        const decodedRefresh = decodeJwt<JwtPayloadType>(refresh_token)

        cookieStore.set('access_token', access_token, {
            httpOnly: true,
            sameSite: 'lax',
            secure: true,
            path: '/',
            expires: new Date(decodedAccess.exp * 1000)
        })
        cookieStore.set('refresh_token', refresh_token, {
            httpOnly: true,
            sameSite: 'lax',
            secure: true,
            path: '/',
            expires: new Date(decodedRefresh.exp * 1000)
        })
        cookieStore.set('user_role', String(user.role), {
            httpOnly: false,
            sameSite: 'lax',
            secure: true,
            path: '/',
            expires: new Date(decodedRefresh.exp * 1000)
        })

        const bffResponse: VerifyEmailResType = {
            status: response.status,
            message: response.message,
            data: { user }
        }
        return NextResponse.json(bffResponse)
    } catch (error) {
        logger.error('Error verifying email:', error)
        return NextResponse.json(
            { message: 'Please provide a valid email verify token.' },
            { status: HTTP_STATUS.BAD_REQUEST }
        )
    }
}
