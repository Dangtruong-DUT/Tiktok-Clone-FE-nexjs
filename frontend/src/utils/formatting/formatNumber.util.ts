export function formatCompactNumber(value: number): string {
    return new Intl.NumberFormat('en-US', {
        notation: 'compact',
        maximumFractionDigits: 1
    }).format(value)
}
