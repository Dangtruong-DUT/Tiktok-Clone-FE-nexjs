import AuthRequestApi from '@/apis/auth.request'
import { HTTP_STATUS } from '@/constants/http'
import { HttpError } from '@/types/errors'
import { JwtPayloadType } from '@/types/common/jwt-payload.type'
import { decodeJwt } from '@/utils/auth/jwt.util'
import { LoginReqBodyType } from '@/types/dtos/auth/auth-request.dto'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    const body = (await request.json()) as LoginReqBodyType
    const cookieStore = await cookies()
    try {
        const response = await AuthRequestApi.login(body)
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
        if (error instanceof HttpError) {
            return NextResponse.json(error.data, { status: error.status })
        } else {
            return NextResponse.json({ message: 'Invalid email or password.' }, { status: HTTP_STATUS.UNAUTHORIZED })
        }
    }
}
