type OrderByItem = string | { column?: string; direction?: string }

type ParamsWithOrderBy = Record<string, unknown> & {
    order_by?: OrderByItem[]
}

export function toQueryParamsWithOrderBy(params: ParamsWithOrderBy): Record<string, unknown> {
    const { order_by, ...rest } = params

    if (!order_by || order_by.length === 0) {
        return rest
    }

    const orderByParams: Record<string, string> = {}

    order_by.forEach((item, index) => {
        if (typeof item === 'string') {
            orderByParams[`order_by[${index}]`] = item
            return
        }

        if (item.column) {
            orderByParams[`order_by[${index}][column]`] = item.column
        }

        if (item.direction) {
            orderByParams[`order_by[${index}][direction]`] = item.direction
        }
    })

    return {
        ...rest,
        ...orderByParams
    }
}
