import AuthRequestApi from '@/apis/auth.request'
import { HTTP_STATUS } from '@/constants/api/http-status'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
    const cookieStore = await cookies()
    const access_token = cookieStore.get('access_token')?.value
    const refresh_token = cookieStore.get('refresh_token')?.value
    cookieStore.delete('access_token')
    cookieStore.delete('refresh_token')
    cookieStore.delete('user_role')
    if (!access_token || !refresh_token) {
        return NextResponse.json({ message: 'Logout successful.' }, { status: HTTP_STATUS.OK })
    }
    try {
        const response = await AuthRequestApi.logout({
            refresh_token,
            access_token
        })
        return NextResponse.json(response, { status: HTTP_STATUS.OK })
    } catch (error) {
        cookieStore.delete('access_token')
        cookieStore.delete('refresh_token')
        cookieStore.delete('user_role')
        return NextResponse.json({ message: 'Logout successful.' }, { status: HTTP_STATUS.OK })
    }
}
