import httpClient from '@/apis/client'
import { NEXT_API_ENDPOINT } from '@/config/endpoint.config'
import { RefreshTokenRes } from '@/types/dtos/auth/auth-response.dto'

export async function handleRefreshToken(params?: {
    onSuccess?: (data: RefreshTokenRes) => void
    onError?: (error: unknown) => void
}) {
    try {
        const res = await httpClient.post<RefreshTokenRes>(NEXT_API_ENDPOINT.API_REFRESH_TOKEN, null, {
            baseUrl: ''
        })
        params?.onSuccess?.(res)
    } catch (error) {
        params?.onError?.(error)
    }
}
