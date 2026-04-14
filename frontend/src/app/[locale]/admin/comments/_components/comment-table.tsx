'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useGetAdminCommentsQuery } from '@/store/services/admin.service'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import AutoPagination from '@/components/auto-pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { DeleteCommentDialog } from './delete-comment-dialog'
import { formatAdminDate, truncateText } from '@/helpers/admin-helpers'
import { MoreHorizontal, Search, AlertCircle } from 'lucide-react'
import { AdminComment } from '@/types/dtos/admin/admin-response.dto'

interface CommentTableProps {
    onCommentDeleted?: () => void
}

/**
 * CommentTable - Displays paginated list of comments with moderation actions
 * Features:
 * - Search by comment content or author
 * - Pagination with per-page selector
 * - Actions: Delete
 * - Shows parent post/author context
 * - Loading skeleton
 */
export function CommentTable({ onCommentDeleted }: CommentTableProps) {
    const t = useTranslations('AdminPage')

    // State
    const [page, setPage] = useState(1)
    const [perPage, setPerPage] = useState(10)
    const [searchTerm, setSearchTerm] = useState('')
    const [sortBy, setSortBy] = useState<'recent' | 'oldest'>('recent')

    // Selected comment for dialog
    const [selectedComment, setSelectedComment] = useState<AdminComment | null>(null)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)

    // Fetch data
    const { data, isLoading, isFetching, refetch } = useGetAdminCommentsQuery({
        page,
        per_page: perPage,
        search: searchTerm || undefined,
        sort_by: sortBy === 'recent' ? '-created_at' : 'created_at'
    })

    const comments = data?.data || []
    const pagination = data?.meta

    // Handlers
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

    const closeDeleteDialog = () => {
        setSelectedComment(null)
        setShowDeleteDialog(false)
    }

    const handleActionSuccess = () => {
        closeDeleteDialog()
        refetch()
        onCommentDeleted?.()
    }

    // Render loading skeleton
    if (isLoading) {
        return (
            <div className='space-y-4'>
                <div className='flex gap-2'>
                    <Skeleton className='h-10 flex-1' />
                    <Skeleton className='h-10 w-32' />
                </div>
                <div className='border rounded-lg'>
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
        <div className='space-y-4'>
            {/* Header - Search and Filters */}
            <div className='flex flex-col gap-3 md:flex-row md:items-end md:justify-between'>
                <div className='flex-1 relative'>
                    <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
                    <Input
                        placeholder={t('comments.placeholders.searchComments')}
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className='pl-10'
                    />
                </div>

                {/* Sort By */}
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

            {/* Table */}
            {comments.length === 0 ? (
                <div className='border rounded-lg p-8 text-center'>
                    <AlertCircle className='w-12 h-12 text-muted-foreground mx-auto mb-3' />
                    <p className='text-muted-foreground'>{t('comments.emptyState')}</p>
                </div>
            ) : (
                <div className='border rounded-lg overflow-hidden'>
                    <Table>
                        <TableHeader>
                            <TableRow className='bg-muted/50'>
                                <TableHead className='font-semibold'>{t('comments.columns.id')}</TableHead>
                                <TableHead className='font-semibold'>{t('comments.columns.author')}</TableHead>
                                <TableHead className='font-semibold'>{t('comments.columns.content')}</TableHead>
                                <TableHead className='font-semibold'>{t('comments.columns.parentPost')}</TableHead>
                                <TableHead className='font-semibold'>{t('comments.columns.date')}</TableHead>
                                <TableHead className='text-right font-semibold'>
                                    {t('comments.columns.actions')}
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {comments.map((comment) => (
                                <TableRow key={comment.id} className='hover:bg-muted/50'>
                                    <TableCell className='font-mono text-sm'>#{comment.id}</TableCell>
                                    <TableCell className='font-medium'>{comment.user?.username || 'N/A'}</TableCell>
                                    <TableCell>
                                        <div className='max-w-xs'>
                                            <p className='text-sm line-clamp-2'>{truncateText(comment.content, 50)}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell className='text-sm'>
                                        {comment.parent?.content ? (
                                            <div>
                                                <p className='font-medium'>
                                                    {truncateText(comment.parent.content, 25)}
                                                </p>
                                                <p className='text-xs text-muted-foreground'>#{comment.parent_id}</p>
                                            </div>
                                        ) : (
                                            <span className='text-muted-foreground'>N/A</span>
                                        )}
                                    </TableCell>
                                    <TableCell className='text-sm'>{formatAdminDate(comment.created_at)}</TableCell>
                                    <TableCell className='text-right'>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant='ghost' size='sm' disabled={isFetching}>
                                                    <MoreHorizontal className='w-4 h-4' />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align='end' className='w-40'>
                                                <DropdownMenuItem
                                                    onClick={() => openDeleteDialog(comment)}
                                                    className='text-red-600 cursor-pointer'
                                                >
                                                    {t('comments.actions.delete')}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Pagination Controls */}
            {pagination && (
                <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
                    {/* Per Page Selector */}
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

                    {/* Info */}
                    <div className='text-sm text-muted-foreground'>
                        {t('common.showingResults', {
                            from: (pagination.current_page - 1) * perPage + 1,
                            to: Math.min(pagination.current_page * perPage, pagination.total),
                            total: pagination.total
                        })}
                    </div>

                    {/* Pagination */}
                    {pagination.last_page > 1 && (
                        <AutoPagination page={page} pageSize={pagination.last_page} onPageChange={setPage} />
                    )}
                </div>
            )}

            {/* Dialog */}
            {selectedComment && (
                <DeleteCommentDialog
                    open={showDeleteDialog}
                    commentId={selectedComment.id}
                    authorUsername={selectedComment.user?.username || 'N/A'}
                    parentPostId={selectedComment.parent_id ?? undefined}
                    onOpenChange={(open) => !open && closeDeleteDialog()}
                    onSuccess={handleActionSuccess}
                />
            )}
        </div>
    )
}
