import AuthRequestApi from '@/apis/auth.request'
import { HTTP_STATUS } from '@/constants/api/http-status'
import { HttpException } from '@/exceptions/HttpException.exception'
import { RegisterReqBodyType } from '@/types/dtos/auth/auth-request.dto'
import { BffAuthUserResponse } from '@/types/dtos/auth/auth-response.dto'
import { setAuthCookies } from '@/utils/auth/cookies.util'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    const body = (await request.json()) as RegisterReqBodyType
    const cookieStore = await cookies()
    try {
        const response = await AuthRequestApi.register(body)
        const { access_token, refresh_token, user } = response.data
        setAuthCookies(cookieStore, { access_token, refresh_token, user_role: user.role })

        const bffResponse: BffAuthUserResponse = {
            status: response.status,
            message: response.message,
            data: { user: response.data.user }
        }
        return NextResponse.json(bffResponse)
    } catch (error) {
        if (error instanceof HttpException) {
            return NextResponse.json(error.data, { status: error.status })
        }
        return NextResponse.json(
            { message: 'Please check your email and password.' },
            { status: HTTP_STATUS.BAD_REQUEST }
        )
    }
}
