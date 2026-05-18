import AuthRequestApi from '@/apis/auth.request'
import { HTTP_STATUS } from '@/constants/api/http-status'
import { HttpException } from '@/exceptions/HttpException.exception'
import { decodeJwt } from '@/utils/auth/jwt.util'
import { JwtPayloadType } from '@/types/common/jwt-payload.type'
import { RegisterReqBodyType } from '@/types/dtos/auth/auth-request.dto'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    const body = (await request.json()) as RegisterReqBodyType
    const cookieStore = await cookies()
    try {
        const response = await AuthRequestApi.register(body)
        const { access_token, refresh_token } = response.data
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

        return NextResponse.json(response)
    } catch (error) {
        if (error instanceof HttpException) {
            return NextResponse.json(error.data, { status: error.status })
        }
        return NextResponse.json({ message: 'Please check your email and password.' }, { status: HTTP_STATUS.BAD_REQUEST })
    }
}
