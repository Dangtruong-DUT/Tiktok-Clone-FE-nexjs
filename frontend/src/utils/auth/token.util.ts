import { NextRequest } from 'next/server'

interface getAuthTokensResult {
    access_token: string | null | undefined
    refresh_token: string | null | undefined
    user_role: string | null | undefined
}
export function getAuthTokens(request: NextRequest): getAuthTokensResult {
    const access_token = request.cookies.get('access_token')?.value
    const refresh_token = request.cookies.get('refresh_token')?.value
    const user_role = request.cookies.get('user_role')?.value
    return { access_token, refresh_token, user_role }
}
