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
