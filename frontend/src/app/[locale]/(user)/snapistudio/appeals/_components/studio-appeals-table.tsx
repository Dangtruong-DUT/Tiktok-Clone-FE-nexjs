'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Eye, Search, X } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { TableSkeleton } from '@/components/data-display/table-skeleton'
import { TablePanel } from '@/components/data-display/table-panel'
import { TablePagination } from '@/components/data-display/table-pagination'
import type { OffsetPaginationMeta } from '@/types/common/pagination-meta.type'
import { EmptyState } from '@/components/common/empty-state'
import { useDialog } from '@/hooks/use-dialog'
import { formatDateTime } from '@/utils/formatting/format-time.util'
import { APPEAL_STATUSES, APPEAL_STATUS_VALUES, type AppealStatus } from '@/constants/appeal'
import { useGetMyAppealsQuery } from '@/store/services/user/appeal.service'
import { AppealDetailDialog, STATUS_STYLES } from './appeal-detail-dialog'
import type { Appeal } from '@/types/models/appeal.model'

const FILTER_ALL = 'all' as const

export function StudioAppealsTable() {
    const t = useTranslations('SnapiStudio.appeals')

    const [page, setPage] = useState(1)
    const [perPage, setPerPage] = useState(10)

    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<typeof FILTER_ALL | AppealStatus>(FILTER_ALL)
    const [draftSearch, setDraftSearch] = useState('')
    const [draftStatus, setDraftStatus] = useState<typeof FILTER_ALL | AppealStatus>(FILTER_ALL)

    const { selectedItem: selectedAppeal, openDialog, closeDialog } = useDialog<Appeal, 'detail'>()

    const { data, isLoading, isFetching } = useGetMyAppealsQuery({
        page,
        per_page: perPage,
        appeal_status: statusFilter === FILTER_ALL ? undefined : statusFilter,
        q: searchTerm.trim() || undefined,
        order_by: ['-created_at']
    })
    const appeals = data?.data ?? []

    const pagination = data?.meta

    const handleSearch = () => {
        setSearchTerm(draftSearch)
        setStatusFilter(draftStatus)
        setPage(1)
    }

    const handleReset = () => {
        setDraftSearch('')
        setDraftStatus(FILTER_ALL)
        setSearchTerm('')
        setStatusFilter(FILTER_ALL)
        setPage(1)
    }

    const hasActiveFilters = statusFilter !== FILTER_ALL || !!searchTerm

    return (
        <>
            <TablePanel
                isFetching={isFetching}
                toolbar={
                    <div className='flex flex-wrap items-center gap-2 px-4 py-3'>
                        <div className='relative min-w-0 flex-1 max-w-md'>
                            <Search className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50' />
                            <Input
                                value={draftSearch}
                                onChange={(e) => setDraftSearch(e.target.value)}
                                placeholder={t('list.searchPlaceholder')}
                                className='rounded-none pl-9 pr-9'
                            />
                            <button
                                type='button'
                                onClick={() => {
                                    setDraftSearch('')
                                    setSearchTerm('')
                                    setPage(1)
                                }}
                                disabled={!draftSearch}
                                className='absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 transition-colors hover:text-muted-foreground disabled:pointer-events-none disabled:opacity-30'
                            >
                                <X className='h-3.5 w-3.5' />
                            </button>
                        </div>

                        <Select
                            value={draftStatus}
                            onValueChange={(v: typeof FILTER_ALL | AppealStatus) => setDraftStatus(v)}
                        >
                            <SelectTrigger className='filter-select w-40'>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={FILTER_ALL}>{t('list.filters.allStatuses')}</SelectItem>
                                {APPEAL_STATUS_VALUES.map((s) => (
                                    <SelectItem key={s} value={s}>
                                        {t(`statuses.${s}`)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Button
                            variant='brand'
                            onClick={handleSearch}
                            disabled={isFetching}
                            size='lg'
                            className='shrink-0 rounded-none'
                        >
                            <Search className='h-3.5 w-3.5' />
                            <span className='ml-1.5 hidden sm:inline'>{t('list.search')}</span>
                        </Button>

                        <Button
                            type='button'
                            variant='outline'
                            size='lg'
                            onClick={handleReset}
                            disabled={!hasActiveFilters}
                            className='shrink-0 rounded-none'
                        >
                            <X className='h-4 w-4' />
                            {t('list.reset')}
                        </Button>
                    </div>
                }
                pagination={
                    pagination ? (
                        <TablePagination
                            pagination={pagination as OffsetPaginationMeta}
                            page={page}
                            perPage={perPage}
                            onPageChange={setPage}
                            onPerPageChange={(n) => {
                                setPerPage(n)
                                setPage(1)
                            }}
                            perPageOptions={[10, 20, 50]}
                            perPageLabel={t('list.perPage')}
                            showingResultsFormatter={(from, to, total) => t('list.showingResults', { from, to, total })}
                        />
                    ) : undefined
                }
            >
                {isLoading ? (
                    <TableSkeleton
                        columnWidths={['w-24 shrink-0', 'w-24', 'flex-1', 'w-20 rounded-full', 'w-24', 'w-8 ml-auto']}
                        rows={6}
                        showToolbar={false}
                        showPagination={false}
                    />
                ) : appeals.length === 0 ? (
                    <EmptyState message={t('list.emptyState')} />
                ) : (
                    <Table dividers>
                        <TableHeader>
                            <TableRow className='bg-muted/40 hover:bg-muted/40'>
                                <TableHead className='table-head'>{t('list.columns.id')}</TableHead>
                                <TableHead className='table-head'>{t('list.columns.type')}</TableHead>
                                <TableHead className='table-head'>{t('list.columns.reason')}</TableHead>
                                <TableHead className='table-head'>{t('list.columns.status')}</TableHead>
                                <TableHead className='table-head'>{t('list.columns.createdAt')}</TableHead>
                                <TableHead className='table-head w-10 text-right'>
                                    {t('list.columns.actions')}
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {appeals.map((appeal) => (
                                <TableRow key={appeal.uuid} className='hover:bg-muted/50 transition-colors'>
                                    <TableCell className='font-mono text-sm text-muted-foreground'>
                                        {appeal.uuid ?? appeal.id}
                                    </TableCell>
                                    <TableCell>
                                        <span className='text-sm'>{t(`types.${appeal.appeal_type}`)}</span>
                                    </TableCell>
                                    <TableCell className='max-w-[200px]'>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <span className='line-clamp-1 cursor-help text-sm text-muted-foreground'>
                                                    {appeal.reason ?? '—'}
                                                </span>
                                            </TooltipTrigger>
                                            {appeal.reason && (
                                                <TooltipContent side='top' className='max-w-xs'>
                                                    <p className='text-xs'>{appeal.reason}</p>
                                                </TooltipContent>
                                            )}
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant='outline'
                                            className={`${STATUS_STYLES[appeal.status] ?? STATUS_STYLES[APPEAL_STATUSES.PENDING]} border text-xs`}
                                        >
                                            {t(`statuses.${appeal.status}`)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className='text-sm text-muted-foreground'>
                                        {formatDateTime(appeal.created_at)}
                                    </TableCell>
                                    <TableCell className='text-right'>
                                        <Button
                                            variant='ghost'
                                            size='icon'
                                            className='h-8 w-8'
                                            onClick={() => openDialog(appeal, 'detail')}
                                        >
                                            <Eye className='h-4 w-4' />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </TablePanel>

            {selectedAppeal && <AppealDetailDialog open appeal={selectedAppeal} onClose={closeDialog} />}
        </>
    )
}
