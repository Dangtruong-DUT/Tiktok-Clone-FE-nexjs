import { LocalesType } from '@/i18n/config'
import TimeAgo from 'javascript-time-ago'
import { logger } from '@/utils/logger.util'

import en from 'javascript-time-ago/locale/en'
import vi from 'javascript-time-ago/locale/vi'

TimeAgo.addLocale(en)
TimeAgo.addLocale(vi)
TimeAgo.setDefaultLocale('en')

export function timeAgo({ locale, date }: { locale: LocalesType; date: string }) {
    try {
        const parsedDate = new Date(date)
        const timeAgo = new TimeAgo(locale)
        return timeAgo.format(parsedDate, 'twitter-minute-now')
    } catch (error) {
        logger.error('Error in timeAgo function:', error)
        return ''
    }
}

export function formatDateTime(dateString: string, locale = 'en-US'): string {
    if (!dateString) return '-'
    try {
        return new Intl.DateTimeFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).format(new Date(dateString))
    } catch (error) {
        logger.error('Error in formatDateTime function:', error)
        return dateString
    }
}

export function formatDateShort(dateString: string, locale = 'en-US'): string {
    if (!dateString) return '-'
    try {
        return new Intl.DateTimeFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(new Date(dateString))
    } catch (error) {
        logger.error('Error in formatDateShort function:', error)
        return dateString
    }
}

export function formatSecondsToTime(time: number): string {
    const minutes = Math.floor(time / 60).toString()
    const seconds = Math.floor(time % 60)
        .toString()
        .padStart(2, '0')
    return `${minutes}:${seconds}`
}

export function timeToMMSSCS(time: number): string {
    const minutes = Math.floor(time / 60)
        .toString()
        .padStart(2, '0')
    const seconds = Math.floor(time % 60)
        .toString()
        .padStart(2, '0')
    const centiseconds = Math.floor((time % 1) * 100)
        .toString()
        .padStart(2, '0')
    return `${minutes}:${seconds}:${centiseconds}`
}

export function formatISOToDisplayDate(data: string): string {
    try {
        const date = new Date(data)
        return new Intl.DateTimeFormat('en-GB', {
            day: '2-digit',
            month: 'short',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        }).format(date)
    } catch (error) {
        logger.error('Error in formatISOToDisplayDate function:', error)
        return ''
    }
}

export function datetimeLocalToUtcIso(value: string): string {
    if (!value) return ''

    const normalized = value.length === 16 ? `${value}:00.000Z` : value.endsWith('Z') ? value : `${value}Z`
    const parsed = new Date(normalized)

    if (Number.isNaN(parsed.getTime())) {
        return ''
    }

    return parsed.toISOString()
}

export function utcIsoToDatetimeLocal(value: string): string {
    if (!value) return ''

    const normalized = /(?:Z|[+-]\d{2}:\d{2})$/.test(value) ? value : `${value}Z`
    const date = new Date(normalized)
    if (Number.isNaN(date.getTime())) {
        return ''
    }

    const pad = (n: number) => String(n).padStart(2, '0')

    return [
        date.getUTCFullYear(),
        pad(date.getUTCMonth() + 1),
        pad(date.getUTCDate())
    ].join('-') + `T${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`
}
