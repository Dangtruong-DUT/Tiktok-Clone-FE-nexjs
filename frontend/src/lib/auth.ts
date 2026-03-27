import httpClient from '@/apis/client'
import { NEXT_API_ENDPOINT } from '@/config/endpoint.config'
import clientSessionToken from '@/services/storage/clientSessionToken'
import { JwtPayloadType } from '@/types/common/jwt-payload.type'
import { RefreshTokenRes } from '@/types/dtos/auth/auth-response.dto'
import { decodeJwt } from '@/utils/auth/jwt.util'

/**
 * Handles the refresh token logic.
 * If the access token is expired or about to expire, it fetches a new access token using the refresh token.
 * If the refresh token is also expired, it clears the session tokens.
 * @param {Object} params - Optional parameters for success and error callbacks.
 * @param {Function} params.onSuccess - Callback function to execute on successful token refresh.
 * @param {Function} params.onError - Callback function to execute on error during token refresh.
 * @param {Function} params.onRefreshTokenExpired - Callback function to execute when the refresh token is expired.
 */

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

    const currentTime = Date.now() / 1000 - 1 // Subtract 1 second to account for any potential delay in token expiration checks
    if (decodeRefreshToken.exp <= currentTime) {
        return params?.onRefreshTokenExpired?.()
    }
    // If the access token is still valid for more than 1/3 of its lifetime, skip the refresh logic
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
