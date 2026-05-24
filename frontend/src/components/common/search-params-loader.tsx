'use client'

import { type ReadonlyURLSearchParams, useSearchParams } from 'next/navigation'
import React, { Suspense, useEffect } from 'react'

type SearchParamsLoaderProps = {
    onParamsReceived: (params: ReadonlyURLSearchParams | null) => void
}

export const SearchParamsLoader = React.memo(Suspender)

function Suspender(props: SearchParamsLoaderProps) {
    return (
        <Suspense>
            <Suspended {...props} />
        </Suspense>
    )
}

function Suspended({ onParamsReceived }: SearchParamsLoaderProps) {
    const searchParams = useSearchParams()

    useEffect(() => {
        onParamsReceived(searchParams)
    }, [searchParams, onParamsReceived])

    return null
}

export function useSearchParamsLoader() {
    const [searchParams, setSearchParams] = React.useState<ReadonlyURLSearchParams | null>(null)

    return {
        searchParams,
        setSearchParams
    }
}
