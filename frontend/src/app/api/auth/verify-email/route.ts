import AuthRequestApi from '@/apis/auth.request'
import { HTTP_STATUS } from '@/constants/api/http-status'
import { VerifyEmailReqBodyType } from '@/types/dtos/user/user-request.dto'
import { VerifyEmailResType } from '@/types/dtos/user/user-response.dto'
import { setAuthCookies } from '@/utils/auth/cookies.util'
import { logger } from '@/utils/logger.util'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

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
        setAuthCookies(cookieStore, { access_token, refresh_token, user_role: user.role })

        const bffResponse: VerifyEmailResType = {
            status: response.status,
            message: response.message,
            data: { user: response.data.user }
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
