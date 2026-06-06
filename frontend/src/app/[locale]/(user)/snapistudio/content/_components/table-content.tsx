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
import { useListStudioPostsQuery, useSchedulePostMutation } from '@/store/services/studio-post-schedule.service'
import { useDeletePostMutation } from '@/store/services/posts.service'
import { DataTable } from '@/components/ui/data-table'
import { TablePanel } from '@/components/data-display/table-panel'
import { TablePagination } from '@/components/data-display/table-pagination'
import type { OffsetPaginationMeta } from '@/types/common/pagination-meta.type'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import AlertDialogDeleteDish from '@/app/[locale]/(user)/snapistudio/content/_components/alert-confirm-delete-post'
import { usePostTableContext } from '@/app/[locale]/(user)/snapistudio/content/_context/content-table.context'
import { useStudioColumns } from '@/app/[locale]/(user)/snapistudio/content/_components/columns'
import { TableSkeleton } from '@/components/data-display/table-skeleton'
import { SNAPISTUDIO_ROUTES } from '@/constants/routes/routes'
import type { StudioPostItem, StudioPostStatus } from '@/types/models/studio-post.model'

type ScheduleFilter = 'all' | '1' | '0'

export default function TableContent() {
    const t = useTranslations('SnapiStudio.content')
    const columns = useStudioColumns()
    const { searchParams, setSearchParams } = useSearchParamsLoader()

    const page = searchParams?.get('page') ? Number(searchParams.get('page')) : 1

    const { setPostIdDelete, postIdDelete } = usePostTableContext()

    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState({})
    const [searchKeyword, setSearchKeyword] = useState('')
    const [statusFilter, setStatusFilter] = useState<StudioPostStatus | 'all'>('all')
    const [scheduleFilter, setScheduleFilter] = useState<ScheduleFilter>('all')
    const [appliedSearchQuery, setAppliedSearchQuery] = useState('')
    const [appliedStatus, setAppliedStatus] = useState<StudioPostStatus | 'all'>('all')
    const [appliedSchedule, setAppliedSchedule] = useState<ScheduleFilter>('all')
    const [pendingAction, setPendingAction] = useState<'search' | 'clear' | null>(null)
    const [pagination, setPagination] = useState({ pageIndex: page - 1, pageSize: 10 })

    const {
        data: queryData,
        isLoading: isLoadingPosts,
        isFetching: isFetchingPosts
    } = useListStudioPostsQuery(
        {
            page: pagination.pageIndex + 1,
            per_page: pagination.pageSize,
            status: appliedStatus === 'all' ? undefined : appliedStatus,
            has_schedule: appliedSchedule === 'all' ? undefined : (Number(appliedSchedule) as 0 | 1),
            q: appliedSearchQuery || undefined
        },
        { refetchOnMountOrArgChange: true }
    )

    const data = (queryData?.data ?? []) as StudioPostItem[]

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
        pageCount: (queryData?.meta as OffsetPaginationMeta | undefined)?.last_page ?? -1
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
        setAppliedStatus(statusFilter)
        setAppliedSchedule(scheduleFilter)
        table.setPageIndex(0)
    }

    const handleClearFilters = () => {
        setPendingAction('clear')
        setSearchKeyword('')
        setStatusFilter('all')
        setScheduleFilter('all')
        setAppliedSearchQuery('')
        setAppliedStatus('all')
        setAppliedSchedule('all')
        table.setPageIndex(0)
    }

    const hasActiveFilters = appliedSearchQuery || appliedStatus !== 'all' || appliedSchedule !== 'all'

    return (
        <div className='w-full space-y-3'>
            <SearchParamsLoader onParamsReceived={setSearchParams} />
            <AlertDialogDeleteDish postIdDelete={postIdDelete} setPostIdDelete={setPostIdDelete} />

            <TablePanel
                isFetching={isFetchingPosts}
                toolbar={
                    <div className='flex flex-wrap items-center gap-2 px-4 py-3'>
                        {/* Search input */}
                        <div className='relative min-w-0 flex-1 max-w-md'>
                            <Search className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50' />
                            <Input
                                placeholder={t('search.placeholder')}
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className='rounded-none pl-9 pr-9'
                            />
                            <button
                                type='button'
                                onClick={() => setSearchKeyword('')}
                                disabled={!searchKeyword}
                                className='absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50
                                           hover:text-muted-foreground disabled:pointer-events-none disabled:opacity-30'
                            >
                                <X className='h-3.5 w-3.5' />
                            </button>
                        </div>

                        {/* Status select */}
                        <Select
                            value={statusFilter}
                            onValueChange={(v) => setStatusFilter(v as StudioPostStatus | 'all')}
                        >
                            <SelectTrigger className='w-[150px] rounded-none'>
                                <SelectValue placeholder='Trạng thái' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='all'>Tất cả trạng thái</SelectItem>
                                <SelectItem value='draft'>Bản nháp</SelectItem>
                                <SelectItem value='scheduled'>Lên lịch</SelectItem>
                                <SelectItem value='published'>Đã đăng</SelectItem>
                                <SelectItem value='failed'>Thất bại</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Schedule status select */}
                        <Select value={scheduleFilter} onValueChange={(v) => setScheduleFilter(v as ScheduleFilter)}>
                            <SelectTrigger className='w-[170px] rounded-none'>
                                <SelectValue placeholder='Lịch đăng' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='all'>Mọi bài</SelectItem>
                                <SelectItem value='1'>Đã lên lịch</SelectItem>
                                <SelectItem value='0'>Chưa lên lịch</SelectItem>
                            </SelectContent>
                        </Select>

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
                            pagination={queryData.meta as OffsetPaginationMeta}
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
                        columnWidths={['w-48 shrink-0', 'w-24', 'w-28', 'w-28', 'w-28', 'w-16 ml-auto']}
                    />
                ) : (
                    <DataTable columns={columns} table={table} emptyText={t('emptyState')} />
                )}
            </TablePanel>
        </div>
    )
}
