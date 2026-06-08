import AuthRequestApi from '@/apis/auth.request'
import { HTTP_STATUS } from '@/constants/api/http-status'
import { verifyForgotPasswordReqBodyType } from '@/types/dtos/auth/auth-request.dto'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    const body = (await request.json()) as verifyForgotPasswordReqBodyType
    try {
        const response = await AuthRequestApi.verifyForgotPassword(body)
        return NextResponse.json(response)
    } catch (error) {
        return NextResponse.json(
            { message: 'Invalid reset password token. Please check the token and try again.' },
            { status: HTTP_STATUS.BAD_REQUEST }
        )
    }
}
