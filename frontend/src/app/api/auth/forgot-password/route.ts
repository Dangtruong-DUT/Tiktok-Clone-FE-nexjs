import AuthRequestApi from '@/apis/auth.request'
import { HTTP_STATUS } from '@/constants/http'
import { HttpException } from '@/exceptions/HttpException.exception'
import { ForgotPasswordReqBodyType } from '@/types/dtos/auth/auth-request.dto'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    const body = (await request.json()) as ForgotPasswordReqBodyType
    try {
        const response = await AuthRequestApi.forgotPassword(body)
        return NextResponse.json(response)
    } catch (error) {
        if (error instanceof HttpException) {
            return NextResponse.json(error.data, { status: error.status })
        } else {
            return NextResponse.json(
                { message: 'Invalid email address. Please enter a valid email address.' },
                { status: HTTP_STATUS.BAD_REQUEST }
            )
        }
    }
}
