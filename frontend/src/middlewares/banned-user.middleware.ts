import { UserVerifyStatus } from '@/constants/enum'
import { JwtPayloadType } from '@/types/common/jwt-payload.type'
import { decodeJwt } from '@/utils/auth/jwt.util'
import { NextRequest, NextResponse } from 'next/server'

type BannedUserMiddlewareParams = {
    refreshToken: string
    pathname: string
    request: NextRequest
    locale: string
}

function toIsoString(value: unknown): string | null {
    if (typeof value !== 'string' || value.trim() === '') {
        return null
    }

    const parsedDate = new Date(value)
    if (Number.isNaN(parsedDate.getTime())) {
        return null
    }

    return parsedDate.toISOString()
}

function getBannedUntil(payload: JwtPayloadType): string | null {
    return (
        toIsoString(payload.ban_until) ||
        toIsoString(payload.banned_until) ||
        toIsoString(payload.ban_expires_at) ||
        toIsoString(payload.locked_until)
    )
}

function getRemainingBannedDays(bannedUntilIso: string | null): number | null {
    if (!bannedUntilIso) {
        return null
    }

    const bannedUntil = new Date(bannedUntilIso)
    const now = new Date()
    const milliseconds = bannedUntil.getTime() - now.getTime()

    if (milliseconds <= 0) {
        return 0
    }

    return Math.ceil(milliseconds / (1000 * 60 * 60 * 24))
}

export function bannedUserMiddleware({
    refreshToken,
    pathname,
    request,
    locale
}: BannedUserMiddlewareParams): NextResponse | null {
    const payload = decodeJwt<JwtPayloadType>(refreshToken)

    const isBanned = payload.banned === true || payload.verify === UserVerifyStatus.BANNED

    if (!isBanned) {
        return null
    }

    const bannedPagePath = `/${locale}/banned`
    const publicAppealPath = `/${locale}/appeal`

    if (pathname === bannedPagePath || pathname.startsWith(publicAppealPath)) {
        return null
    }

    const bannedUntil = getBannedUntil(payload)
    const remainingDays = getRemainingBannedDays(bannedUntil)
    const tokenRemainingDays = typeof payload.ban_remaining_days === 'number' ? payload.ban_remaining_days : null

    const targetUrl = new URL(bannedPagePath, request.url)
    if (bannedUntil) {
        targetUrl.searchParams.set('ban_until', bannedUntil)
    }
    const resolvedRemainingDays = tokenRemainingDays ?? remainingDays
    if (resolvedRemainingDays !== null) {
        targetUrl.searchParams.set('days', String(resolvedRemainingDays))
    }

    return NextResponse.redirect(targetUrl)
}
