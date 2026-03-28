'use client'

import AppLoader from '@/components/app-loader'
import { useAppSelector } from '@/store/hooks'

export default function GlobalAppLoader() {
    const isLoading = useAppSelector((state) => Object.keys(state.app.loadingByKey).length > 0)

    if (!isLoading) return null

    return <AppLoader />
}
