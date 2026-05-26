'use client'

import { useTranslations } from 'next-intl'
import { useGetAdminCommentsQuery } from '@/store/services/admin'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Trash2, Eye } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AdminTableToolbar } from '@/components/admin'
import { TablePanel } from '@/components/data-display/table-panel'
import { TablePagination } from '@/components/data-display/table-pagination'
import { TableSkeleton } from '@/components/data-display/table-skeleton'
import { TooltipIconButton } from '@/components/ui/tooltip-icon-button'
import { EmptyState } from '@/components/common/empty-state'
import { DeleteCommentDialog } from './delete-comment-dialog'
import { CommentDetailDialog } from './comment-detail-dialog'
import { truncateText } from '@/utils/admin/admin.util'
import { formatDateTime } from '@/utils/formatting/format-time.util'
import { useAdminTableState } from '@/hooks/use-admin-table-state'
import { useDialog } from '@/hooks/use-dialog'
import type { SortOrder } from '@/constants/ui/table'
import type { AdminComment } from '@/types/dtos/admin/admin-response.dto'

interface CommentTableProps {
    onCommentDeleted?: () => void
}

type DialogType = 'detail' | 'delete'

export function CommentTable({ onCommentDeleted }: CommentTableProps) {
    const t = useTranslations('AdminPage')

    const {
        page,
        perPage,
        searchTerm,
        sortBy,
        draftSort,
        hasActiveFilters,
        setPage,
        setDraftSort,
        handleSearch,
        handleReset,
        handlePerPageChange
    } = useAdminTableState()

    const { selectedItem: selectedComment, dialogType, openDialog, closeDialog } = useDialog<AdminComment, DialogType>()

    const { data, isLoading, isFetching, refetch } = useGetAdminCommentsQuery({
        page,
        per_page: perPage,
        q: searchTerm || undefined,
        order_by: [sortBy === 'recent' ? '-created_at' : 'created_at']
    })

    const comments: AdminComment[] = data?.data ?? []
    const pagination = data?.meta

    const handleActionSuccess = () => {
        closeDialog()
        refetch()
        onCommentDeleted?.()
    }

    if (isLoading) {
        return <TableSkeleton columnWidths={['w-8 shrink-0', 'w-24', 'flex-1', 'w-20', 'w-24', 'w-16 ml-auto']} />
    }

    return (
        <TooltipProvider>
            <TablePanel
                isFetching={isFetching}
                toolbar={
                    <AdminTableToolbar
                        searchValue={searchTerm}
                        onSearchChange={handleSearch}
                        searchPlaceholder={t('comments.placeholders.searchComments')}
                        hasActiveFilters={hasActiveFilters}
                        onResetFilters={handleReset}
                        resetLabel={t('common.reset')}
                        isFetching={isFetching}
                        filters={
                            <Select value={draftSort} onValueChange={(v) => setDraftSort(v as SortOrder)}>
                                <SelectTrigger className={`filter-select w-32`}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='recent'>{t('comments.filters.recent')}</SelectItem>
                                    <SelectItem value='oldest'>{t('comments.filters.oldest')}</SelectItem>
                                </SelectContent>
                            </Select>
                        }
                    />
                }
                pagination={
                    pagination ? (
                        <TablePagination
                            pagination={pagination}
                            page={page}
                            perPage={perPage}
                            onPageChange={setPage}
                            onPerPageChange={handlePerPageChange}
                            perPageLabel={t('common.perPage')}
                            showingResultsFormatter={(from, to, total) =>
                                t('common.showingResults', { from, to, total })
                            }
                        />
                    ) : undefined
                }
            >
                {comments.length === 0 ? (
                    <EmptyState message={t('comments.emptyState')} />
                ) : (
                    <Table dividers>
                        <TableHeader>
                            <TableRow className='hover:bg-muted/40'>
                                <TableHead className='table-head w-16'>{t('comments.columns.id')}</TableHead>
                                <TableHead className='table-head'>{t('comments.columns.author')}</TableHead>
                                <TableHead className='table-head'>{t('comments.columns.content')}</TableHead>
                                <TableHead className='table-head w-28'>
                                    {t('comments.columns.parentPost')}
                                </TableHead>
                                <TableHead className='table-head'>{t('comments.columns.date')}</TableHead>
                                <TableHead className='text-right table-head w-24'>
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
                                        {formatDateTime(comment.created_at)}
                                    </TableCell>
                                    <TableCell className='text-right'>
                                        <div className='flex items-center justify-end gap-1'>
                                            <TooltipIconButton
                                                icon={Eye}
                                                tooltip={t('comments.actions.view')}
                                                onClick={() => openDialog(comment, 'detail')}
                                                disabled={isFetching}
                                                className='text-muted-foreground hover:text-foreground'
                                            />
                                            <TooltipIconButton
                                                icon={Trash2}
                                                tooltip={t('comments.actions.delete')}
                                                onClick={() => openDialog(comment, 'delete')}
                                                disabled={isFetching}
                                                className='text-destructive hover:text-destructive hover:bg-destructive/10'
                                            />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </TablePanel>

            {selectedComment && (
                <>
                    <CommentDetailDialog
                        open={dialogType === 'detail'}
                        comment={selectedComment}
                        onOpenChange={(open) => !open && closeDialog()}
                    />
                    <DeleteCommentDialog
                        open={dialogType === 'delete'}
                        commentUuid={selectedComment.uuid}
                        authorUsername={selectedComment.author?.username ?? '—'}
                        parentPostId={selectedComment.parent_id ?? undefined}
                        onOpenChange={(open) => !open && closeDialog()}
                        onSuccess={handleActionSuccess}
                    />
                </>
            )}
        </TooltipProvider>
    )
}
