'use client'

import {
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable
} from '@tanstack/react-table'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { Search, X } from 'lucide-react'

import { SearchParamsLoader, useSearchParamsLoader } from '@/components/searchparams-loader'
import { useGetPostOfUserPagingQuery } from '@/store/services/posts.service'
import useCurrentUserData from '@/hooks/data/useCurrentUserData'
import { DataTable } from '@/components/ui/data-table'
import AutoPagination from '@/components/auto-pagination'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import AudienceSelect from '@/components/audience-select'
import AlertDialogDeleteDish from '@/app/[locale]/(user)/snapistudio/content/_components/alert-confirm-delete-post'
import { usePostTableContext } from '@/app/[locale]/(user)/snapistudio/content/_context/content-table.context'
import { useColumns } from '@/app/[locale]/(user)/snapistudio/content/_components/columns'
import TableSkeleton from '@/app/[locale]/(user)/snapistudio/content/_components/table-skeleton'
import { Audience } from '@/constants/enum'

export default function TableContent() {
    const t = useTranslations('SnapiStudio.content')
    const currentUser = useCurrentUserData()
    const columns = useColumns()
    const { searchParams, setSearchParams } = useSearchParamsLoader()

    const page = searchParams?.get('page') ? Number(searchParams.get('page')) : 1

    const { setPostIdDelete, postIdDelete } = usePostTableContext()

    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState({})
    const [searchKeyword, setSearchKeyword] = useState('')
    const [audienceFilter, setAudienceFilter] = useState('all')
    const [appliedSearchQuery, setAppliedSearchQuery] = useState('')
    const [appliedAudience, setAppliedAudience] = useState<Audience | undefined>(undefined)
    const [pendingAction, setPendingAction] = useState<'search' | 'clear' | null>(null)
    const [pagination, setPagination] = useState({ pageIndex: page - 1, pageSize: 10 })

    const {
        data: queryData,
        isLoading: isLoadingPosts,
        isFetching: isFetchingPosts
    } = useGetPostOfUserPagingQuery(
        {
            page: pagination.pageIndex + 1,
            userId: currentUser?.uuid || '',
            q: appliedSearchQuery || undefined,
            audience: appliedAudience
        },
        { skip: !currentUser?.uuid }
    )

    const data = queryData?.data || []

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onPaginationChange: setPagination,
        autoResetPageIndex: false,
        state: { sorting, columnFilters, columnVisibility, rowSelection, pagination },
        manualPagination: true,
        pageCount: queryData?.meta?.last_page ?? -1
    })

    useEffect(() => {
        setPagination((prev) => ({ ...prev, pageIndex: page - 1 }))
    }, [page])

    useEffect(() => {
        if (!isFetchingPosts) setPendingAction(null)
    }, [isFetchingPosts])

    const handleSearch = () => {
        setPendingAction('search')
        setAppliedSearchQuery(searchKeyword.trim())
        setAppliedAudience(audienceFilter === 'all' ? undefined : (Number(audienceFilter) as Audience))
        table.setPageIndex(0)
    }

    const handleClearFilters = () => {
        setPendingAction('clear')
        setSearchKeyword('')
        setAudienceFilter('all')
        setAppliedSearchQuery('')
        setAppliedAudience(undefined)
        table.setPageIndex(0)
    }

    const hasActiveFilters = appliedSearchQuery || appliedAudience !== undefined

    return (
        <div className='w-full space-y-4'>
            <SearchParamsLoader onParamsReceived={setSearchParams} />
            <AlertDialogDeleteDish postIdDelete={postIdDelete} setPostIdDelete={setPostIdDelete} />

            {/* Search & Filters */}
            <div className='flex flex-col gap-3 md:flex-row md:items-center'>
                <div className='relative flex-1 md:max-w-sm'>
                    <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                    <Input
                        placeholder={t('search.placeholder')}
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className='pl-9'
                    />
                    {searchKeyword && (
                        <button
                            onClick={() => setSearchKeyword('')}
                            className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                        >
                            <X className='h-3.5 w-3.5' />
                        </button>
                    )}
                </div>

                <AudienceSelect
                    value={audienceFilter}
                    onValueChange={setAudienceFilter}
                    className='md:w-[180px]'
                    placeholder={t('filter.audiencePlaceholder')}
                    includeAllOption
                    allOptionLabel={t('filter.allAudience')}
                    disabled={isFetchingPosts}
                />

                <div className='flex gap-2 md:ml-auto'>
                    {hasActiveFilters && (
                        <Button
                            variant='ghost'
                            size='sm'
                            onClick={handleClearFilters}
                            disabled={isFetchingPosts && pendingAction === 'clear'}
                        >
                            <X className='mr-1.5 h-3.5 w-3.5' />
                            {t('search.clearButton')}
                        </Button>
                    )}
                    <Button
                        size='sm'
                        onClick={handleSearch}
                        disabled={isFetchingPosts}
                        className='bg-brand hover:bg-brand/90 text-white'
                    >
                        <Search className='mr-1.5 h-3.5 w-3.5' />
                        {isFetchingPosts && pendingAction === 'search'
                            ? t('search.searchingButton')
                            : t('search.searchButton')}
                    </Button>
                </div>
            </div>

            {/* Table */}
            {isLoadingPosts ? (
                <TableSkeleton rows={pagination.pageSize} />
            ) : (
                <DataTable columns={columns} table={table} emptyText={t('emptyState')} />
            )}

            {/* Pagination */}
            {queryData?.meta && queryData.meta.last_page > 1 && (
                <div className='flex items-center justify-between py-2'>
                    <p className='text-sm text-muted-foreground'>
                        {t('showingResults', {
                            from: (queryData.meta.current_page - 1) * pagination.pageSize + 1,
                            to: Math.min(queryData.meta.current_page * pagination.pageSize, queryData.meta.total),
                            total: queryData.meta.total
                        })}
                    </p>
                    <AutoPagination
                        page={table.getState().pagination.pageIndex + 1}
                        pageSize={queryData.meta.last_page}
                        pathname='/snapistudio/content'
                    />
                </div>
            )}
        </div>
    )
}
