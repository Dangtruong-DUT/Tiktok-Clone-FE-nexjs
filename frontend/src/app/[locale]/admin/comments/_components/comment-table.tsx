'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useGetAdminCommentsQuery } from '@/store/services/admin/index'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Trash2, Eye } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Skeleton } from '@/components/ui/skeleton'
import { AdminTableToolbar, AdminTablePagination, AdminTableWrapper } from '@/components/admin'
import { DeleteCommentDialog } from './delete-comment-dialog'
import { CommentDetailDialog } from './comment-detail-dialog'
import { formatAdminDate, truncateText } from '@/helpers/admin-helpers'
import type { AdminComment } from '@/types/dtos/admin/admin-response.dto'

interface CommentTableProps {
    onCommentDeleted?: () => void
}

type SortOrder = 'recent' | 'oldest'

export function CommentTable({ onCommentDeleted }: CommentTableProps) {
    const t = useTranslations('AdminPage')

    const [page, setPage] = useState(1)
    const [perPage, setPerPage] = useState(10)
    const [searchTerm, setSearchTerm] = useState('')
    const [sortBy, setSortBy] = useState<SortOrder>('recent')
    const [selectedComment, setSelectedComment] = useState<AdminComment | null>(null)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [showDetailDialog, setShowDetailDialog] = useState(false)

    const { data, isLoading, isFetching, refetch } = useGetAdminCommentsQuery({
        page,
        per_page: perPage,
        q: searchTerm || undefined,
        order_by: [sortBy === 'recent' ? '-created_at' : 'created_at']
    })

    const comments: AdminComment[] = data?.data ?? []
    const pagination = data?.meta

    const hasActiveFilters = sortBy !== 'recent'

    const handleSearch = (value: string) => {
        setSearchTerm(value)
        setPage(1)
    }

    const handleResetFilters = () => {
        setSortBy('recent')
        setPage(1)
    }

    const openDeleteDialog = (comment: AdminComment) => {
        setSelectedComment(comment)
        setShowDeleteDialog(true)
    }

    const openDetailDialog = (comment: AdminComment) => {
        setSelectedComment(comment)
        setShowDetailDialog(true)
    }

    const closeDeleteDialog = () => {
        setSelectedComment(null)
        setShowDeleteDialog(false)
    }

    const closeDetailDialog = () => {
        setSelectedComment(null)
        setShowDetailDialog(false)
    }

    const handleActionSuccess = () => {
        closeDeleteDialog()
        refetch()
        onCommentDeleted?.()
    }

    if (isLoading) {
        return (
            <div className='space-y-4'>
                <div className='rounded-xl border bg-card shadow-xs p-3'>
                    <Skeleton className='h-9 w-full rounded-lg' />
                </div>
                <div className='rounded-xl border bg-card shadow-xs overflow-hidden divide-y'>
                    <div className='bg-muted/40 px-3 py-3'><Skeleton className='h-4 w-3/4' /></div>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className='flex items-center gap-4 px-3 py-4'>
                            <Skeleton className='h-4 w-8 shrink-0' />
                            <Skeleton className='h-4 w-24' />
                            <Skeleton className='h-4 flex-1' />
                            <Skeleton className='h-4 w-20' />
                            <Skeleton className='h-4 w-24' />
                            <Skeleton className='h-8 w-16 rounded-lg' />
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <TooltipProvider>
            <div className='space-y-4'>
                <AdminTableToolbar
                    searchValue={searchTerm}
                    onSearchChange={handleSearch}
                    searchPlaceholder={t('comments.placeholders.searchComments')}
                    hasActiveFilters={hasActiveFilters}
                    onResetFilters={handleResetFilters}
                    resetLabel={t('common.reset')}
                    isFetching={isFetching}
                    filters={
                        <Select value={sortBy} onValueChange={(v) => { setSortBy(v as SortOrder); setPage(1) }}>
                            <SelectTrigger className='h-8 w-32 rounded-lg text-xs'>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='recent'>{t('comments.filters.recent')}</SelectItem>
                                <SelectItem value='oldest'>{t('comments.filters.oldest')}</SelectItem>
                            </SelectContent>
                        </Select>
                    }
                />

                <AdminTableWrapper isFetching={isFetching}>
                {comments.length === 0 ? (
                    <div className='rounded-xl border bg-card p-12 text-center shadow-xs'>
                        <p className='text-sm text-muted-foreground'>{t('comments.emptyState')}</p>
                    </div>
                ) : (
                    <div className='rounded-xl border bg-card shadow-xs overflow-hidden'>
                        <Table>
                            <TableHeader>
                                <TableRow className='hover:bg-muted/40'>
                                    <TableHead className='text-xs font-semibold uppercase tracking-wide text-muted-foreground w-16'>
                                        {t('comments.columns.id')}
                                    </TableHead>
                                    <TableHead className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                                        {t('comments.columns.author')}
                                    </TableHead>
                                    <TableHead className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                                        {t('comments.columns.content')}
                                    </TableHead>
                                    <TableHead className='text-xs font-semibold uppercase tracking-wide text-muted-foreground w-28'>
                                        {t('comments.columns.parentPost')}
                                    </TableHead>
                                    <TableHead className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                                        {t('comments.columns.date')}
                                    </TableHead>
                                    <TableHead className='text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground w-24'>
                                        {t('comments.columns.actions')}
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {comments.map((comment) => (
                                    <TableRow key={comment.id} className='hover:bg-muted/40'>
                                        <TableCell className='font-mono text-xs text-muted-foreground'>
                                            #{comment.id}
                                        </TableCell>
                                        <TableCell className='text-sm font-medium'>
                                            {comment.author?.username ?? '—'}
                                        </TableCell>
                                        <TableCell>
                                            <p className='max-w-xs text-sm text-muted-foreground line-clamp-2'>
                                                {truncateText(comment.content, 60)}
                                            </p>
                                        </TableCell>
                                        <TableCell className='text-sm text-muted-foreground'>
                                            {comment.parent_id ? `#${comment.parent_id}` : '—'}
                                        </TableCell>
                                        <TableCell className='text-sm text-muted-foreground'>
                                            {formatAdminDate(comment.created_at)}
                                        </TableCell>
                                        <TableCell className='text-right'>
                                            <div className='flex items-center justify-end gap-1'>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant='ghost'
                                                            size='icon'
                                                            className='h-8 w-8 text-muted-foreground hover:text-foreground'
                                                            onClick={() => openDetailDialog(comment)}
                                                            disabled={isFetching}
                                                        >
                                                            <Eye className='h-4 w-4' />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>{t('comments.actions.view')}</TooltipContent>
                                                </Tooltip>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant='ghost'
                                                            size='icon'
                                                            className='h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10'
                                                            onClick={() => openDeleteDialog(comment)}
                                                            disabled={isFetching}
                                                        >
                                                            <Trash2 className='h-4 w-4' />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>{t('comments.actions.delete')}</TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
                </AdminTableWrapper>

                {pagination && (
                    <AdminTablePagination
                        pagination={pagination}
                        page={page}
                        perPage={perPage}
                        onPageChange={setPage}
                        onPerPageChange={(n) => { setPerPage(n); setPage(1) }}
                    />
                )}

                {selectedComment && (
                    <>
                        <CommentDetailDialog
                            open={showDetailDialog}
                            comment={selectedComment}
                            onOpenChange={(open) => !open && closeDetailDialog()}
                        />
                        <DeleteCommentDialog
                            open={showDeleteDialog}
                            commentUuid={selectedComment.uuid}
                            authorUsername={selectedComment.author?.username ?? '—'}
                            parentPostId={selectedComment.parent_id ?? undefined}
                            onOpenChange={(open) => !open && closeDeleteDialog()}
                            onSuccess={handleActionSuccess}
                        />
                    </>
                )}
            </div>
        </TooltipProvider>
    )
}
