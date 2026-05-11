'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useGetAdminCommentsQuery } from '@/store/services/admin/index'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, X, Trash2, Eye } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import AutoPagination from '@/components/auto-pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { DeleteCommentDialog } from './delete-comment-dialog'
import { CommentDetailDialog } from './comment-detail-dialog'
import { formatAdminDate, truncateText } from '@/helpers/admin-helpers'
import { AdminComment } from '@/types/dtos/admin/admin-response.dto'
import type { PaginationMeta } from '@/types/common/pagination-meta.type'

interface CommentTableProps {
    onCommentDeleted?: () => void
}

interface AdminCommentsApiResponse {
    data: AdminComment[]
    meta?: PaginationMeta
}

export function CommentTable({ onCommentDeleted }: CommentTableProps) {
    const t = useTranslations('AdminPage')

    const [page, setPage] = useState(1)
    const [perPage, setPerPage] = useState(10)
    const [searchTerm, setSearchTerm] = useState('')
    const [sortBy, setSortBy] = useState<'recent' | 'oldest'>('recent')
    const [selectedComment, setSelectedComment] = useState<AdminComment | null>(null)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [showDetailDialog, setShowDetailDialog] = useState(false)

    const commentsQuery = useGetAdminCommentsQuery({
        page,
        per_page: perPage,
        q: searchTerm || undefined,
        order_by: [sortBy === 'recent' ? '-created_at' : 'created_at']
    }) as unknown as {
        data?: AdminCommentsApiResponse
        isLoading: boolean
        isFetching: boolean
        refetch: () => unknown
    }
    const { isLoading, isFetching, refetch } = commentsQuery
    const responseData = commentsQuery.data as AdminCommentsApiResponse | undefined

    const comments: AdminComment[] = responseData?.data ?? []
    const pagination = responseData?.meta
    const totalItems = pagination?.total ?? comments.length

    const handleSearch = (value: string) => {
        setSearchTerm(value)
        setPage(1)
    }

    const handlePerPageChange = (value: string) => {
        setPerPage(Number(value))
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
                <div className='flex gap-2'>
                    <Skeleton className='h-10 flex-1' />
                    <Skeleton className='h-10 w-32' />
                </div>
                <div className='rounded-xl border bg-background shadow-sm overflow-hidden'>
                    <div className='p-4 space-y-3'>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className='h-16' />
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <TooltipProvider>
            <div className='space-y-4'>
                <div className='flex flex-col gap-3 md:flex-row md:items-end md:justify-between'>
                    <div className='flex-1 relative md:max-w-sm'>
                        <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                        <Input
                            placeholder={t('comments.placeholders.searchComments')}
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            className='pl-9'
                        />
                        {searchTerm && (
                            <button
                                onClick={() => handleSearch('')}
                                className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                            >
                                <X className='h-3.5 w-3.5' />
                            </button>
                        )}
                    </div>

                    <Select
                        value={sortBy}
                        onValueChange={(v) => {
                            setSortBy(v as 'recent' | 'oldest')
                            setPage(1)
                        }}
                    >
                        <SelectTrigger className='w-32'>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='recent'>{t('comments.filters.recent')}</SelectItem>
                            <SelectItem value='oldest'>{t('comments.filters.oldest')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {comments.length === 0 ? (
                    <div className='rounded-xl border bg-background p-10 text-center'>
                        <p className='text-muted-foreground'>{t('comments.emptyState')}</p>
                    </div>
                ) : (
                    <div className='rounded-xl border bg-background shadow-sm overflow-hidden'>
                        <Table>
                            <TableHeader>
                                <TableRow className='bg-muted/40'>
                                    <TableHead className='text-xs uppercase tracking-wide text-muted-foreground'>
                                        {t('comments.columns.id')}
                                    </TableHead>
                                    <TableHead className='text-xs uppercase tracking-wide text-muted-foreground'>
                                        {t('comments.columns.author')}
                                    </TableHead>
                                    <TableHead className='text-xs uppercase tracking-wide text-muted-foreground'>
                                        {t('comments.columns.content')}
                                    </TableHead>
                                    <TableHead className='text-xs uppercase tracking-wide text-muted-foreground'>
                                        {t('comments.columns.parentPost')}
                                    </TableHead>
                                    <TableHead className='text-xs uppercase tracking-wide text-muted-foreground'>
                                        {t('comments.columns.date')}
                                    </TableHead>
                                    <TableHead className='text-right text-xs uppercase tracking-wide text-muted-foreground'>
                                        {t('comments.columns.actions')}
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {comments.map((comment: AdminComment) => (
                                    <TableRow key={comment.id} className='hover:bg-muted/50'>
                                        <TableCell className='font-mono text-sm'>#{comment.id}</TableCell>
                                        <TableCell className='font-medium'>{comment.author?.username || 'N/A'}</TableCell>
                                        <TableCell>
                                            <p className='max-w-xs text-sm line-clamp-2'>
                                                {truncateText(comment.content, 50)}
                                            </p>
                                        </TableCell>
                                        <TableCell className='text-sm'>
                                            {comment.parent_id ? (
                                                <p className='text-xs text-muted-foreground'>#{comment.parent_id}</p>
                                            ) : (
                                                <span className='text-muted-foreground'>—</span>
                                            )}
                                        </TableCell>
                                        <TableCell className='text-sm'>{formatAdminDate(comment.created_at)}</TableCell>
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

                {pagination && (
                    <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
                        <div className='flex items-center gap-2'>
                            <span className='text-sm text-muted-foreground'>{t('common.perPage')}</span>
                            <Select value={String(perPage)} onValueChange={handlePerPageChange}>
                                <SelectTrigger className='w-20'>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='5'>5</SelectItem>
                                    <SelectItem value='10'>10</SelectItem>
                                    <SelectItem value='25'>25</SelectItem>
                                    <SelectItem value='50'>50</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className='text-sm text-muted-foreground'>
                            {t('common.showingResults', {
                                from: (pagination.current_page - 1) * perPage + 1,
                                to: Math.min(pagination.current_page * perPage, totalItems),
                                total: totalItems
                            })}
                        </div>

                        {pagination.last_page > 1 && (
                            <AutoPagination page={page} pageSize={pagination.last_page} onPageChange={setPage} />
                        )}
                    </div>
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
                            authorUsername={selectedComment.author?.username || 'N/A'}
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
