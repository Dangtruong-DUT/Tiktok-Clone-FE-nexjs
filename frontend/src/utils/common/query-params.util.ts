type OrderByItem = string | { column?: string; direction?: string }

type ParamsWithOrderBy = Record<string, unknown> & {
    order_by?: OrderByItem[]
}

const DESC_VALUES = new Set(['desc', 'descending', 'descend', '-1'])
const ASC_VALUES = new Set(['asc', 'ascending', 'ascend', '1'])

function normalizeOrderByItem(item: OrderByItem | null | undefined): string | null {
    if (!item) {
        return null
    }

    if (typeof item === 'string') {
        const value = item.trim()
        return value.length > 0 ? value : null
    }

    const column = item.column?.trim()
    if (!column) {
        return null
    }

    const direction = item.direction?.trim().toLowerCase()
    if (!direction || ASC_VALUES.has(direction)) {
        return column
    }

    if (DESC_VALUES.has(direction)) {
        return `-${column}`
    }

    return column
}

export function toQueryParams(params: ParamsWithOrderBy): Record<string, unknown> {
    const { order_by, ...rest } = params
    const cleanedRest = Object.fromEntries(
        Object.entries(rest).filter(([, value]) => value !== null && value !== undefined)
    )

    if (!order_by || order_by.length === 0) {
        return cleanedRest
    }

    const normalizedOrderBy = order_by
        .map((item) => normalizeOrderByItem(item))
        .filter((item): item is string => Boolean(item))

    if (normalizedOrderBy.length === 0) {
        return cleanedRest
    }

    const orderByParams: Record<string, string> = {}
    normalizedOrderBy.forEach((item, index) => {
        orderByParams[`order_by[${index}]`] = item
    })

    return {
        ...cleanedRest,
        ...orderByParams
    }
}
