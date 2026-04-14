export function formatCompactNumber(value: number): string {
    return new Intl.NumberFormat('en-US', {
        notation: 'compact',
        maximumFractionDigits: 1
    }).format(value)
}

export function formatNumber(value: number, locale: string = 'en-US'): string {
    return new Intl.NumberFormat(locale).format(value)
}
