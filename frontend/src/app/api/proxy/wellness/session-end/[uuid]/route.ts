import httpClient from '@/apis/client'
import { HTTP_STATUS } from '@/constants/api/http-status'
import { BACKEND_API_ENDPOINT } from '@/constants/api/endpoints'
import { AUTH_COOKIE } from '@/constants/auth'
import { getAuthCookies } from '@/utils/auth/cookies.util'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest, { params }: { params: Promise<{ uuid: string }> }) {
    const cookieStore = await cookies()
    const accessToken = getAuthCookies(cookieStore, AUTH_COOKIE.ACCESS_TOKEN)

    if (!accessToken) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: HTTP_STATUS.UNAUTHORIZED })
    }

    const { uuid } = await params

    let durationSeconds = 0
    try {
        const text = await request.text()
        const body = JSON.parse(text)
        durationSeconds = Number(body.duration_seconds ?? 0)
    } catch {
        // sendBeacon may send text/plain — use fallback duration
    }

    try {
        const response = await httpClient.post(
            BACKEND_API_ENDPOINT.WELLNESS.SESSION_END(uuid),
            { duration_seconds: durationSeconds },
            { headers: { Authorization: `Bearer ${accessToken}` } }
        )
        return NextResponse.json(response)
    } catch {
        // Fire-and-forget: always return 200 so sendBeacon doesn't retry
        return NextResponse.json({ message: 'ok' }, { status: HTTP_STATUS.OK })
    }
}
