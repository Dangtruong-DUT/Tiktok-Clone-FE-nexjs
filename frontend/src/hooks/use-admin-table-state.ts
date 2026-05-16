'use client'

import { useState } from 'react'
import type { SortOrder } from '@/constants/ui/admin'

interface UseAdminTableStateReturn {
    page: number
    perPage: number
    searchTerm: string
    statusFilter: string
    sortBy: SortOrder
    draftStatus: string
    draftSort: SortOrder
    hasActiveFilters: boolean
    setPage: (p: number) => void
    setDraftStatus: (s: string) => void
    setDraftSort: (s: SortOrder) => void
    handleSearch: (value: string) => void
    handleReset: () => void
    handlePerPageChange: (n: number) => void
}

export function useAdminTableState(defaultStatus = 'all'): UseAdminTableStateReturn {
    const [page, setPage] = useState(1)
    const [perPage, setPerPage] = useState(10)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState(defaultStatus)
    const [sortBy, setSortBy] = useState<SortOrder>('recent')
    const [draftStatus, setDraftStatus] = useState(defaultStatus)
    const [draftSort, setDraftSort] = useState<SortOrder>('recent')

    const hasActiveFilters = statusFilter !== 'all' || sortBy !== 'recent'

    const handleSearch = (value: string) => {
        setSearchTerm(value)
        setStatusFilter(draftStatus)
        setSortBy(draftSort)
        setPage(1)
    }

    const handleReset = () => {
        setDraftStatus('all')
        setDraftSort('recent')
        setStatusFilter('all')
        setSortBy('recent')
        setPage(1)
    }

    const handlePerPageChange = (n: number) => {
        setPerPage(n)
        setPage(1)
    }

    return {
        page,
        perPage,
        searchTerm,
        statusFilter,
        sortBy,
        draftStatus,
        draftSort,
        hasActiveFilters,
        setPage,
        setDraftStatus,
        setDraftSort,
        handleSearch,
        handleReset,
        handlePerPageChange
    }
}
