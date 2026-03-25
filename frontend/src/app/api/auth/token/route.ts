import { HTTP_STATUS } from '@/constants/http'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    return NextResponse.json(
        {
            message: 'This route is blocked to prevent abuse.'
        },
        { status: HTTP_STATUS.FORBIDDEN }
    )
}
