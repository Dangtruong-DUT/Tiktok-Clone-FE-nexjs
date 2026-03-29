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

import { SearchParamsLoader, useSearchParamsLoader } from '@/components/searchparams-loader'
import { useGetPostOfUserPagingQuery } from '@/store/services/posts.service'
import useCurrentUserData from '@/hooks/data/useCurrentUserData'
import { DataTable } from '@/components/ui/data-table'
import AutoPagination from '@/components/auto-pagination'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import AudienceSelect from '@/components/common/audience-select'
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
    const [pagination, setPagination] = useState({
        pageIndex: page - 1,
        pageSize: 10
    })

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
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            pagination
        },
        manualPagination: true,
        pageCount: queryData?.meta?.last_page ?? -1
    })

    useEffect(() => {
        setPagination((prev) => ({
            ...prev,
            pageIndex: page - 1
        }))
    }, [page])

    useEffect(() => {
        if (!isFetchingPosts) {
            setPendingAction(null)
        }
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

    return (
        <div className='w-full relative'>
            <SearchParamsLoader onParamsReceived={setSearchParams} />
            <AlertDialogDeleteDish postIdDelete={postIdDelete} setPostIdDelete={setPostIdDelete} />
            <Card className='py-4 mb-4'>
                <CardContent className='px-4'>
                    <div className='flex flex-col gap-3 md:flex-row md:items-center'>
                        <Input
                            placeholder={t('search.placeholder')}
                            value={searchKeyword}
                            onChange={(event) => setSearchKeyword(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    handleSearch()
                                }
                            }}
                            className='w-full md:flex-1 md:max-w-[220px]'
                        />

                        <AudienceSelect
                            value={audienceFilter}
                            onValueChange={setAudienceFilter}
                            className='md:w-[220px]'
                            placeholder={t('filter.audiencePlaceholder')}
                            includeAllOption
                            allOptionLabel={t('filter.allAudience')}
                            disabled={isFetchingPosts}
                        />

                        <div className='flex w-full gap-2 md:ml-auto md:w-auto'>
                            <Button
                                variant='outline'
                                className='flex-1 md:flex-none'
                                onClick={handleClearFilters}
                                disabled={isFetchingPosts}
                            >
                                {isFetchingPosts && pendingAction === 'clear' ? (
                                    <>
                                        <Loader2 className='h-4 w-4 animate-spin' />
                                        {t('search.clearingButton')}
                                    </>
                                ) : (
                                    t('search.clearButton')
                                )}
                            </Button>
                            <Button
                                className='flex-1 md:flex-none bg-brand hover:bg-brand/90 text-white'
                                onClick={handleSearch}
                                disabled={isFetchingPosts}
                            >
                                {isFetchingPosts && pendingAction === 'search' ? (
                                    <>
                                        <Loader2 className='h-4 w-4 animate-spin' />
                                        {t('search.searchingButton')}
                                    </>
                                ) : (
                                    t('search.searchButton')
                                )}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
            {isLoadingPosts ? <TableSkeleton /> : <DataTable columns={columns} table={table} />}
            <div className='flex items-center justify-end space-x-2 py-4'>
                <div>
                    <AutoPagination
                        page={table.getState().pagination.pageIndex + 1}
                        pageSize={queryData?.meta?.last_page || 1}
                        pathname='/snapistudio/content'
                    />
                </div>
            </div>
        </div>
    )
}
