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

import { SearchParamsLoader, useSearchParamsLoader } from '@/components/common/search-params-loader'
import { useGetPostOfUserPagingQuery } from '@/store/services/posts.service'
import useCurrentUserData from '@/hooks/data/useCurrentUserData'
import { DataTable } from '@/components/ui/data-table'
import { TablePanel } from '@/components/data-display/table-panel'
import { TablePagination } from '@/components/data-display/table-pagination'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import AudienceSelect from '@/components/forms/audience-select'
import AlertDialogDeleteDish from '@/app/[locale]/(user)/snapistudio/content/_components/alert-confirm-delete-post'
import { usePostTableContext } from '@/app/[locale]/(user)/snapistudio/content/_context/content-table.context'
import { useColumns } from '@/app/[locale]/(user)/snapistudio/content/_components/columns'
import { TableSkeleton } from '@/components/data-display/table-skeleton'
import { Audience } from '@/constants/enum'
import { SNAPISTUDIO_ROUTES } from '@/constants/routes/routes'

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
            per_page: pagination.pageSize,
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
        <div className='w-full space-y-3'>
            <SearchParamsLoader onParamsReceived={setSearchParams} />
            <AlertDialogDeleteDish postIdDelete={postIdDelete} setPostIdDelete={setPostIdDelete} />

            <TablePanel
                isFetching={isFetchingPosts}
                toolbar={
                    <div className='flex flex-wrap items-center gap-2 px-4 py-3'>
                        <div className='relative min-w-0 flex-1 max-w-md'>
                            <Search className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50' />
                            <Input
                                placeholder={t('search.placeholder')}
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                className='rounded-none pl-9 pr-9'
                            />
                            <button
                                type='button'
                                onClick={() => setSearchKeyword('')}
                                disabled={!searchKeyword}
                                className='absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 transition-colors hover:text-muted-foreground disabled:pointer-events-none disabled:opacity-30'
                            >
                                <X className='h-3.5 w-3.5' />
                            </button>
                        </div>

                        <AudienceSelect
                            value={audienceFilter}
                            onValueChange={setAudienceFilter}
                            className='filter-select w-40'
                            placeholder={t('filter.audiencePlaceholder')}
                            includeAllOption
                            allOptionLabel={t('filter.allAudience')}
                            disabled={isFetchingPosts}
                        />

                        <Button
                            variant='brand'
                            onClick={handleSearch}
                            disabled={isFetchingPosts}
                            size='lg'
                            className='shrink-0 rounded-none'
                        >
                            <Search className='h-3.5 w-3.5' />
                            <span className='ml-1.5 hidden sm:inline'>
                                {isFetchingPosts && pendingAction === 'search'
                                    ? t('search.searchingButton')
                                    : t('search.searchButton')}
                            </span>
                        </Button>

                        <Button
                            type='button'
                            variant='outline'
                            size='lg'
                            onClick={handleClearFilters}
                            disabled={!hasActiveFilters}
                            className='shrink-0 rounded-none'
                        >
                            <X className='h-4 w-4' />
                            {t('search.clearButton')}
                        </Button>
                    </div>
                }
                pagination={
                    queryData?.meta ? (
                        <TablePagination
                            pagination={queryData.meta}
                            page={table.getState().pagination.pageIndex + 1}
                            perPage={table.getState().pagination.pageSize}
                            onPerPageChange={(n) => {
                                table.setPageSize(n)
                                table.setPageIndex(0)
                            }}
                            onPageChange={(p) => table.setPageIndex(p - 1)}
                            perPageOptions={[10, 20, 50]}
                            perPageLabel={t('perPage')}
                            showingResultsFormatter={(from, to, total) => t('showingResults', { from, to, total })}
                            pathname={SNAPISTUDIO_ROUTES.CONTENT}
                        />
                    ) : undefined
                }
            >
                {isLoadingPosts ? (
                    <TableSkeleton
                        rows={pagination.pageSize}
                        showToolbar={false}
                        showPagination={false}
                        columnWidths={['w-48 shrink-0', 'w-36', 'w-8', 'w-8', 'w-16 ml-auto']}
                    />
                ) : (
                    <DataTable columns={columns} table={table} emptyText={t('emptyState')} />
                )}
            </TablePanel>
        </div>
    )
}
