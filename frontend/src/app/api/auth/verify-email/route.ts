import AuthRequestApi from '@/apis/auth.request'
import { HTTP_STATUS } from '@/constants/http'
import { AuthApi } from '@/services/RTK/auth.services'
import { SetCookieBodyType } from '@/types/auth'
import { HttpError } from '@/types/errors'
import { TokenPayload } from '@/types/jwt'
import { decodeJwt } from '@/utils/jwt'
import { VerifyEmailReqBodyType } from '@/utils/validations/user.schema'
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
        const { access_token, refresh_token } = response.data

        const decodedAccessToken = decodeJwt<TokenPayload>(access_token)
        const decodedRefreshToken = decodeJwt<TokenPayload>(refresh_token)

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
        return NextResponse.json(
            { message: 'Please provide a valid email verify token.' },
            { status: HTTP_STATUS.BAD_REQUEST }
        )
    }
}
