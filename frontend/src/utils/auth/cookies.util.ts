import { AUTH_COOKIE } from '@/constants/auth'
import { JwtPayloadType } from '@/types/common/jwt-payload.type'
import { UserAuthType } from '@/types/dtos/auth/auth-response.dto'
import { decodeJwt } from '@/utils/auth/jwt.util'
import type { cookies } from 'next/headers'

export type AuthCookieKey = (typeof AUTH_COOKIE)[keyof typeof AUTH_COOKIE]

export type AllAuthCookies = Record<AuthCookieKey, string | undefined>

interface CookieReader {
    get(name: string): { value: string } | undefined
}

type CookieStore = Awaited<ReturnType<typeof cookies>>

const AUTH_COOKIE_KEYS = Object.values(AUTH_COOKIE) as AuthCookieKey[]

export function getAuthCookies(store: CookieReader): AllAuthCookies
export function getAuthCookies(store: CookieReader, key: AuthCookieKey): string | undefined
export function getAuthCookies(store: CookieReader, key?: AuthCookieKey): AllAuthCookies | string | undefined {
    if (key !== undefined) return store.get(key)?.value
    return {
        [AUTH_COOKIE.ACCESS_TOKEN]: store.get(AUTH_COOKIE.ACCESS_TOKEN)?.value,
        [AUTH_COOKIE.REFRESH_TOKEN]: store.get(AUTH_COOKIE.REFRESH_TOKEN)?.value,
        [AUTH_COOKIE.USER_ROLE]: store.get(AUTH_COOKIE.USER_ROLE)?.value,
        [AUTH_COOKIE.ACCESS_TOKEN_EXP]: store.get(AUTH_COOKIE.ACCESS_TOKEN_EXP)?.value
    }
}

export function deleteAuthCookies(store: CookieStore): void
export function deleteAuthCookies(store: CookieStore, key: AuthCookieKey): void
export function deleteAuthCookies(store: CookieStore, key?: AuthCookieKey): void {
    if (key !== undefined) {
        store.delete(key)
        return
    }
    AUTH_COOKIE_KEYS.forEach((k) => store.delete(k))
}

interface CookieSettable {
    set(
        name: string,
        value: string,
        options?: {
            httpOnly?: boolean
            secure?: boolean
            sameSite?: 'lax' | 'strict' | 'none'
            expires?: Date
            path?: string
        }
    ): unknown
}

interface AuthTokens {
    access_token: string
    refresh_token: string
    user_role: UserAuthType['role']
}

export function setAuthCookies(cookieStore: CookieSettable, { access_token, refresh_token, user_role }: AuthTokens) {
    const decodedAccess = decodeJwt<JwtPayloadType>(access_token)
    const decodedRefresh = decodeJwt<JwtPayloadType>(refresh_token)

    const base = { sameSite: 'lax' as const, secure: true, path: '/' }
    const accessExpires = new Date(decodedAccess.exp * 1000)
    const refreshExpires = new Date(decodedRefresh.exp * 1000)

    cookieStore.set(AUTH_COOKIE.ACCESS_TOKEN, access_token, { ...base, httpOnly: true, expires: accessExpires })
    cookieStore.set(AUTH_COOKIE.REFRESH_TOKEN, refresh_token, { ...base, httpOnly: true, expires: refreshExpires })
    cookieStore.set(AUTH_COOKIE.USER_ROLE, String(user_role), { ...base, httpOnly: false, expires: refreshExpires })
    cookieStore.set(AUTH_COOKIE.ACCESS_TOKEN_EXP, String(decodedAccess.exp), {
        ...base,
        httpOnly: false,
        expires: accessExpires
    })
}
