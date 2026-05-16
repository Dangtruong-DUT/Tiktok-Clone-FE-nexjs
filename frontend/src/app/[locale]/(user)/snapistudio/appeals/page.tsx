'use client'

import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useGetMyAppealsQuery } from '@/store/services/appeal.service'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import AutoPagination from '@/components/auto-pagination'
import { formatAdminDate } from '@/helpers/admin-helpers'
import { AlertCircle, CheckCircle2, Clock, Eye, FileText, Search, User, X, XCircle } from 'lucide-react'
import { APPEAL_STATUSES, APPEAL_STATUS_VALUES, type AppealStatus } from '@/constants/status/appeal'
import type { Appeal, ResourcePreview } from '@/types/models/appeal.model'
import Image from 'next/image'

const FILTER_ALL = 'all' as const

const STATUS_STYLES: Record<string, string> = {
    [APPEAL_STATUSES.APPROVED]: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    [APPEAL_STATUSES.REJECTED]: 'bg-red-50 text-red-700 border-red-200',
    [APPEAL_STATUSES.PENDING]: 'bg-amber-50 text-amber-700 border-amber-200'
}

function ResourcePreviewBlock({ preview }: { preview: ResourcePreview }) {
    if (preview.type === 'post') {
        return (
            <div className='space-y-3'>
                {preview.is_deleted && (
                    <div className='flex items-center gap-1.5 rounded-md bg-red-50 dark:bg-red-950/40 px-3 py-2 text-xs text-red-600 dark:text-red-400'>
                        <AlertCircle className='h-3.5 w-3.5 shrink-0' />
                        Post was deleted — showing cached info
                    </div>
                )}
                {preview.thumbnail_url && (
                    <div className='relative h-[180px] w-full rounded-lg overflow-hidden bg-black'>
                        <Image
                            src={preview.thumbnail_url}
                            alt='Post thumbnail'
                            fill
                            className='object-cover opacity-90'
                            unoptimized
                        />
                    </div>
                )}
                <div className='space-y-1'>
                    {preview.content && <p className='text-sm text-foreground line-clamp-3'>{preview.content}</p>}
                    {preview.author && (
                        <div className='flex items-center gap-2 mt-2'>
                            <Avatar className='size-6'>
                                <AvatarImage src={preview.author.avatar ?? undefined} />
                                <AvatarFallback className='text-xs'>
                                    {preview.author.username.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <span className='text-xs text-muted-foreground'>@{preview.author.username}</span>
                        </div>
                    )}
                </div>
                {(preview.likes_count !== undefined || preview.comments_count !== undefined) && (
                    <div className='flex gap-4 text-xs text-muted-foreground border-t pt-2'>
                        <span>{preview.likes_count ?? 0} likes</span>
                        <span>{preview.comments_count ?? 0} comments</span>
                    </div>
                )}
            </div>
        )
    }

    if (preview.type === 'comment') {
        return (
            <div className='space-y-3'>
                {preview.is_deleted && (
                    <div className='flex items-center gap-1.5 rounded-md bg-red-50 dark:bg-red-950/40 px-3 py-2 text-xs text-red-600 dark:text-red-400'>
                        <AlertCircle className='h-3.5 w-3.5 shrink-0' />
                        Comment was deleted — showing cached info
                    </div>
                )}
                {preview.author && (
                    <div className='flex items-center gap-2'>
                        <Avatar className='size-8'>
                            <AvatarImage src={preview.author.avatar ?? undefined} />
                            <AvatarFallback className='text-xs'>
                                {preview.author.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <span className='text-sm font-medium'>@{preview.author.username}</span>
                    </div>
                )}
                <div className='rounded-lg bg-muted/40 px-4 py-3'>
                    <p className='text-sm'>{preview.content}</p>
                </div>
            </div>
        )
    }

    if (preview.type === 'user') {
        return (
            <div className='flex flex-col items-center gap-3 py-4'>
                <Avatar className='size-16'>
                    <AvatarImage src={preview.avatar ?? undefined} />
                    <AvatarFallback>
                        <User className='h-8 w-8' />
                    </AvatarFallback>
                </Avatar>
                <p className='font-semibold'>@{preview.username}</p>
                <div className='flex gap-2'>
                    {preview.is_banned && (
                        <Badge variant='outline' className='bg-red-50 text-red-700 border-red-200 text-xs'>
                            Banned
                        </Badge>
                    )}
                    {preview.is_deleted && (
                        <Badge variant='outline' className='bg-gray-100 text-gray-600 border-gray-200 text-xs'>
                            Deleted
                        </Badge>
                    )}
                </div>
            </div>
        )
    }

    return null
}

function AppealDetailDialog({ open, appeal, onClose }: { open: boolean; appeal: Appeal; onClose: () => void }) {
    const t = useTranslations('SnapiStudio.appeals')
    const statusStyle = STATUS_STYLES[appeal.status] ?? STATUS_STYLES[APPEAL_STATUSES.PENDING]
    const hasPreview = !!appeal.resource_preview

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className='sm:max-w-[860px]'>
                <DialogHeader>
                    <DialogTitle>{t('detail.title')}</DialogTitle>
                </DialogHeader>

                <div className='grid gap-5 md:grid-cols-[1fr_1fr]'>
                    {/* Left: Appeal Info */}
                    <div className='space-y-4'>
                        {/* Meta */}
                        <div className='rounded-lg border bg-muted/30 p-4 space-y-3 text-sm'>
                            <div className='flex items-center justify-between'>
                                <span className='text-xs uppercase tracking-wide text-muted-foreground font-medium'>
                                    {t('detail.fields.status')}
                                </span>
                                <Badge variant='outline' className={`${statusStyle} border text-xs`}>
                                    {t(`statuses.${appeal.status}`)}
                                </Badge>
                            </div>
                            <InfoRow label={t('detail.fields.type')} value={t(`types.${appeal.appeal_type}`)} />
                            <InfoRow label={t('detail.fields.createdAt')} value={formatAdminDate(appeal.created_at)} />
                            {appeal.reviewed_at && (
                                <InfoRow
                                    label={t('detail.fields.reviewedAt')}
                                    value={formatAdminDate(appeal.reviewed_at)}
                                />
                            )}
                            {appeal.resource_type && (
                                <InfoRow label={t('detail.fields.resource')} value={appeal.resource_type} />
                            )}
                        </div>

                        {/* Reason */}
                        <div className='rounded-lg border bg-background p-4 space-y-2'>
                            <p className='text-xs uppercase tracking-wide text-muted-foreground font-medium'>
                                {t('detail.fields.reason')}
                            </p>
                            <p className='text-sm text-foreground whitespace-pre-wrap'>{appeal.reason || '—'}</p>
                        </div>

                        {/* Admin Response with status banner */}
                        {appeal.status === APPEAL_STATUSES.APPROVED && (
                            <div className='flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-3'>
                                <CheckCircle2 className='h-5 w-5 text-emerald-600 shrink-0 mt-0.5' />
                                <div>
                                    <p className='text-sm font-semibold text-emerald-800 dark:text-emerald-300'>
                                        {t('statuses.approved')} — Action Reversed
                                    </p>
                                    {appeal.admin_response && (
                                        <p className='text-xs text-emerald-700 dark:text-emerald-400 mt-0.5'>
                                            {appeal.admin_response}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                        {appeal.status === APPEAL_STATUSES.REJECTED && (
                            <div className='flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/40 px-4 py-3'>
                                <XCircle className='h-5 w-5 text-red-600 shrink-0 mt-0.5' />
                                <div>
                                    <p className='text-sm font-semibold text-red-800 dark:text-red-300'>
                                        {t('statuses.rejected')}
                                    </p>
                                    {appeal.admin_response && (
                                        <p className='text-xs text-red-700 dark:text-red-400 mt-0.5'>
                                            {appeal.admin_response}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                        {appeal.status === APPEAL_STATUSES.PENDING && !appeal.admin_response && (
                            <div className='flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/40 px-4 py-3'>
                                <Clock className='h-5 w-5 text-amber-600 shrink-0 mt-0.5' />
                                <p className='text-sm text-amber-800 dark:text-amber-300'>{t('detail.noResponse')}</p>
                            </div>
                        )}

                        {/* Timeline */}
                        <div className='space-y-2'>
                            <p className='text-xs uppercase tracking-wide text-muted-foreground font-medium'>
                                Timeline
                            </p>
                            <ol className='relative border-l border-border ml-3 space-y-4'>
                                <li className='pl-5'>
                                    <span className='absolute -left-1.5 mt-1 h-3 w-3 rounded-full border border-background bg-emerald-500' />
                                    <p className='text-xs font-medium text-foreground'>Appeal submitted</p>
                                    <p className='text-xs text-muted-foreground'>
                                        {formatAdminDate(appeal.created_at)}
                                    </p>
                                </li>
                                {appeal.reviewed_at && (
                                    <li className='pl-5'>
                                        <span
                                            className={`absolute -left-1.5 mt-1 h-3 w-3 rounded-full border border-background ${
                                                appeal.status === APPEAL_STATUSES.APPROVED
                                                    ? 'bg-emerald-500'
                                                    : 'bg-red-500'
                                            }`}
                                        />
                                        <p className='text-xs font-medium text-foreground'>
                                            Appeal{' '}
                                            {appeal.status === APPEAL_STATUSES.APPROVED ? 'approved' : 'rejected'}
                                        </p>
                                        <p className='text-xs text-muted-foreground'>
                                            {formatAdminDate(appeal.reviewed_at)}
                                        </p>
                                    </li>
                                )}
                                {!appeal.reviewed_at && (
                                    <li className='pl-5 opacity-50'>
                                        <span className='absolute -left-1.5 mt-1 h-3 w-3 rounded-full border-2 border-muted-foreground bg-background' />
                                        <p className='text-xs font-medium text-muted-foreground'>Pending review...</p>
                                    </li>
                                )}
                            </ol>
                        </div>

                        {/* Evidence */}
                        {appeal.evidence_files && appeal.evidence_files.length > 0 && (
                            <div className='rounded-lg border bg-background p-4 space-y-2'>
                                <p className='text-xs uppercase tracking-wide text-muted-foreground font-medium'>
                                    {t('detail.fields.evidence')} ({appeal.evidence_files.length})
                                </p>
                                <div className='flex flex-wrap gap-2'>
                                    {appeal.evidence_files.map((file, i) => (
                                        <a
                                            key={file.id}
                                            href={file.url}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='relative h-16 w-16 rounded-lg overflow-hidden border hover:ring-2 hover:ring-primary transition-all'
                                        >
                                            <Image
                                                src={file.url}
                                                alt={file.file_name || `Evidence ${i + 1}`}
                                                fill
                                                className='object-cover'
                                                unoptimized
                                            />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: Resource Preview */}
                    <div className='space-y-2'>
                        <p className='text-sm font-semibold'>{t('detail.resourceTitle')}</p>
                        <div className='rounded-lg border bg-muted/20 p-4 min-h-[200px]'>
                            {hasPreview ? (
                                <ResourcePreviewBlock preview={appeal.resource_preview!} />
                            ) : (
                                <div className='flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground'>
                                    <FileText className='h-8 w-8' />
                                    <p className='text-sm'>{t('detail.resourceUnavailable')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className='flex justify-end pt-2'>
                    <Button variant='outline' size='sm' onClick={onClose}>
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className='flex items-start justify-between gap-4'>
            <span className='text-xs text-muted-foreground shrink-0'>{label}</span>
            <span className='text-xs font-medium text-right'>{value}</span>
        </div>
    )
}

export default function StudioAppealsPage() {
    const t = useTranslations('SnapiStudio.appeals')

    const [page, setPage] = useState(1)
    const [perPage, setPerPage] = useState(10)

    // Applied state — used in API query
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<typeof FILTER_ALL | AppealStatus>(FILTER_ALL)

    // Draft state — only applied on Search click
    const [draftSearch, setDraftSearch] = useState('')
    const [draftStatus, setDraftStatus] = useState<typeof FILTER_ALL | AppealStatus>(FILTER_ALL)

    const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null)

    const { data, isLoading, isFetching } = useGetMyAppealsQuery({
        page,
        per_page: perPage,
        appeal_status: statusFilter === FILTER_ALL ? undefined : statusFilter,
        order_by: ['-created_at']
    })

    const appeals = useMemo(() => {
        const list = data?.data ?? []
        const keyword = searchTerm.trim().toLowerCase()
        if (!keyword) return list
        return list.filter((appeal) =>
            [appeal.appeal_type, appeal.resource_type, appeal.reason, appeal.status]
                .join(' ')
                .toLowerCase()
                .includes(keyword)
        )
    }, [data?.data, searchTerm])

    const pagination = data?.meta
    const totalItems = pagination?.total ?? appeals.length

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
        <div className='max-w-6xl mx-auto p-4 md:p-6 space-y-3'>
            {/* Toolbar — ngoài card */}
            <div className='flex flex-wrap items-center gap-2'>
                <div className='relative min-w-0 flex-1 max-w-[320px]'>
                    <Search className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50' />
                    <Input
                        value={draftSearch}
                        onChange={(e) => setDraftSearch(e.target.value)}
                        placeholder={t('list.searchPlaceholder')}
                        className='h-8 rounded-md border-transparent bg-muted/50 pl-8 pr-8 text-sm focus-visible:border-border focus-visible:bg-background focus-visible:ring-0'
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

                <Select value={draftStatus} onValueChange={(v: typeof FILTER_ALL | AppealStatus) => setDraftStatus(v)}>
                    <SelectTrigger className='h-8 w-40 rounded-md text-sm'>
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
                    size='sm'
                    onClick={handleSearch}
                    disabled={isFetching}
                    className='h-8 shrink-0 rounded-md bg-primary px-3 text-xs text-primary-foreground shadow-none hover:bg-primary/85 disabled:opacity-50'
                >
                    <Search className='h-3.5 w-3.5' />
                    <span className='ml-1.5 hidden sm:inline'>{t('list.search')}</span>
                </Button>

                <button
                    type='button'
                    onClick={handleReset}
                    disabled={!hasActiveFilters}
                    className='flex h-8 shrink-0 items-center gap-1 rounded-md border border-border/60 px-2.5 text-xs text-muted-foreground transition-colors hover:border-border hover:text-foreground disabled:pointer-events-none disabled:opacity-30'
                >
                    <X className='h-3 w-3' />
                    {t('list.reset')}
                </button>
            </div>

            {/* Table */}
            {isLoading ? (
                <div className='rounded-xl border bg-background shadow-sm overflow-hidden divide-y'>
                    <div className='bg-muted/30 px-4 py-2.5'>
                        <Skeleton className='h-3.5 w-1/2' />
                    </div>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className='flex items-center gap-4 px-4 py-3.5'>
                            <Skeleton className='h-3.5 w-24 shrink-0' />
                            <Skeleton className='h-3.5 w-24' />
                            <Skeleton className='h-3.5 flex-1' />
                            <Skeleton className='h-5 w-20 rounded-full' />
                            <Skeleton className='h-3.5 w-24' />
                            <Skeleton className='h-7 w-8 rounded-md ml-auto' />
                        </div>
                    ))}
                </div>
            ) : appeals.length === 0 ? (
                <div className='rounded-xl border bg-background p-10 text-center'>
                    <AlertCircle className='h-10 w-10 text-muted-foreground mx-auto mb-3' />
                    <p className='text-sm text-muted-foreground'>{t('list.emptyState')}</p>
                </div>
            ) : (
                <div className='rounded-xl border bg-background shadow-sm overflow-hidden'>
                    <Table>
                        <TableHeader>
                            <TableRow className='bg-muted/40 hover:bg-muted/40'>
                                {[
                                    t('list.columns.id'),
                                    t('list.columns.type'),
                                    t('list.columns.reason'),
                                    t('list.columns.status'),
                                    t('list.columns.createdAt')
                                ].map((label) => (
                                    <TableHead
                                        key={label}
                                        className='text-xs uppercase tracking-wide text-muted-foreground font-semibold'
                                    >
                                        {label}
                                    </TableHead>
                                ))}
                                <TableHead className='w-10' />
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
                                        <TooltipProvider>
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
                                        </TooltipProvider>
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
                                        {formatAdminDate(appeal.created_at)}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant='ghost'
                                            size='icon'
                                            className='h-8 w-8'
                                            onClick={() => setSelectedAppeal(appeal)}
                                        >
                                            <Eye className='h-4 w-4' />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Pagination — 1 hàng */}
            {pagination && (
                <div className='flex items-center gap-3 px-1'>
                    <div className='flex items-center gap-1.5 shrink-0'>
                        <span className='text-xs text-muted-foreground'>{t('list.perPage')}</span>
                        <Select
                            value={String(perPage)}
                            onValueChange={(v) => {
                                setPerPage(Number(v))
                                setPage(1)
                            }}
                        >
                            <SelectTrigger className='h-7 w-14 rounded border-border/60 text-xs'>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {[10, 20, 50].map((n) => (
                                    <SelectItem key={n} value={String(n)} className='text-xs'>
                                        {n}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <span className='text-xs text-muted-foreground shrink-0'>
                        {t('list.showingResults', {
                            from: (pagination.current_page - 1) * perPage + 1,
                            to: Math.min(pagination.current_page * perPage, totalItems),
                            total: totalItems
                        })}
                    </span>

                    {pagination.last_page > 1 && (
                        <div className='ml-auto'>
                            <AutoPagination page={page} pageSize={pagination.last_page} onPageChange={setPage} />
                        </div>
                    )}
                </div>
            )}

            {selectedAppeal && (
                <AppealDetailDialog open appeal={selectedAppeal} onClose={() => setSelectedAppeal(null)} />
            )}
        </div>
    )
}
