import httpClient from '@/apis/client'
import { NEXT_API_ENDPOINT } from '@/config/endpoint.config'
import clientSessionToken from '@/services/storage/clientSessionToken'
import { JwtPayloadType } from '@/types/common/jwt-payload.type'
import { RefreshTokenRes } from '@/types/dtos/auth/auth-response.dto'
import { decodeJwt } from '@/utils/auth/jwt.util'

export async function handleRefreshToken(params?: {
    onSuccess?: (data: RefreshTokenRes) => void
    onError?: (error: unknown) => void
    onRefreshTokenExpired?: () => void
    force?: boolean
}) {
    const accessToken = clientSessionToken.getAccessToken()
    const refreshToken = clientSessionToken.getRefreshToken()
    if (!accessToken || !refreshToken) return

    const decodeAccessToken = decodeJwt<JwtPayloadType>(accessToken)
    const decodeRefreshToken = decodeJwt<JwtPayloadType>(refreshToken)

    const currentTime = Date.now() / 1000 - 1
    if (decodeRefreshToken.exp <= currentTime) {
        return params?.onRefreshTokenExpired?.()
    }
    if (!params?.force && decodeAccessToken.exp - currentTime > (decodeAccessToken.exp - decodeAccessToken.iat) / 3)
        return

    try {
        const res = await httpClient.post<RefreshTokenRes>(NEXT_API_ENDPOINT.API_REFRESH_TOKEN, null, {
            baseUrl: ''
        })
        params?.onSuccess?.(res)
    } catch (error) {
        params?.onError?.(error)
    }
}
