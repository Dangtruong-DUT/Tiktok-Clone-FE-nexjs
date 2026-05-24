'use client'

import { useTranslations } from 'next-intl'
import { useGetAdminPostsQuery } from '@/store/services/admin'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Trash2, Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AdminTableToolbar } from '@/components/admin'
import { TablePanel } from '@/components/table-panel'
import { TablePagination } from '@/components/table-pagination'
import { TableSkeleton } from '@/components/table-skeleton'
import { TooltipIconButton } from '@/components/ui/tooltip-icon-button'
import { EmptyState } from '@/components/empty-state'
import { DeletePostDialog } from './delete-post-dialog'
import { PostPreviewDialog } from './post-preview-dialog'
import { getPostStatusColor, getPostStatus, truncateText } from '@/utils/admin/admin.util'
import { formatDateTime } from '@/utils/formatting/format-time.util'
import { useAdminTableState } from '@/hooks/use-admin-table-state'
import { useDialog } from '@/hooks/use-dialog'
import { TABLE_HEAD_CLASS } from '@/constants/admin/ui'
import type { SortOrder } from '@/constants/ui/table'
import type { AdminPost } from '@/types/dtos/admin/admin-response.dto'

interface PostModerationTableProps {
    onPostDeleted?: () => void
}

type PostStatusFilter = 'all' | 'visible'
type DialogType = 'preview' | 'delete'

export function PostModerationTable({ onPostDeleted }: PostModerationTableProps) {
    const t = useTranslations('AdminPage')

    const {
        page,
        perPage,
        searchTerm,
        statusFilter,
        sortBy,
        draftStatus,
        draftSort,
        hasActiveFilters,
        setPage,
        setDraftStatus,
        setDraftSort,
        handleSearch,
        handleReset,
        handlePerPageChange
    } = useAdminTableState('all')

    const { selectedItem: selectedPost, dialogType, openDialog, closeDialog } = useDialog<AdminPost, DialogType>()

    const { data, isLoading, isFetching, refetch } = useGetAdminPostsQuery({
        page,
        per_page: perPage,
        q: searchTerm || undefined,
        status: statusFilter !== 'all' ? (statusFilter as PostStatusFilter) : undefined,
        order_by: [sortBy === 'recent' ? '-created_at' : 'created_at']
    })

    const posts = data?.data ?? []
    const pagination = data?.meta

    const handleActionSuccess = () => {
        closeDialog()
        refetch()
        onPostDeleted?.()
    }

    if (isLoading) {
        return (
            <TableSkeleton
                columnWidths={['w-8 shrink-0', 'flex-1', 'w-24', 'w-16 rounded-full', 'w-24', 'w-16 ml-auto']}
            />
        )
    }

    return (
        <>
            <TablePanel
                isFetching={isFetching}
                toolbar={
                    <AdminTableToolbar
                        searchValue={searchTerm}
                        onSearchChange={handleSearch}
                        searchPlaceholder={t('posts.placeholders.searchPosts')}
                        hasActiveFilters={hasActiveFilters}
                        onResetFilters={handleReset}
                        resetLabel={t('common.reset')}
                        isFetching={isFetching}
                        filters={
                            <>
                                <Select
                                    value={draftStatus}
                                    onValueChange={(v) => setDraftStatus(v as PostStatusFilter)}
                                >
                                    <SelectTrigger className='h-7 w-36 rounded text-xs'>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='all'>{t('posts.filters.allStatuses')}</SelectItem>
                                        <SelectItem value='visible'>{t('posts.filters.visible')}</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={draftSort} onValueChange={(v) => setDraftSort(v as SortOrder)}>
                                    <SelectTrigger className='h-7 w-32 rounded text-xs'>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='recent'>{t('posts.filters.recent')}</SelectItem>
                                        <SelectItem value='oldest'>{t('posts.filters.oldest')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </>
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
                {posts.length === 0 ? (
                    <EmptyState message={t('posts.emptyState')} />
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className='hover:bg-muted/40'>
                                <TableHead className={`${TABLE_HEAD_CLASS} w-16`}>{t('posts.columns.id')}</TableHead>
                                <TableHead className={TABLE_HEAD_CLASS}>{t('posts.columns.title')}</TableHead>
                                <TableHead className={TABLE_HEAD_CLASS}>{t('posts.columns.author')}</TableHead>
                                <TableHead className={`${TABLE_HEAD_CLASS} w-28`}>
                                    {t('posts.columns.status')}
                                </TableHead>
                                <TableHead className={TABLE_HEAD_CLASS}>{t('posts.columns.uploadDate')}</TableHead>
                                <TableHead className={`text-right ${TABLE_HEAD_CLASS} w-24`}>
                                    {t('posts.columns.actions')}
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {posts.map((post) => {
                                const status = getPostStatus(post)
                                return (
                                    <TableRow key={post.id} className='hover:bg-muted/40'>
                                        <TableCell className='font-mono text-xs text-muted-foreground'>
                                            #{post.id}
                                        </TableCell>
                                        <TableCell>
                                            <p className='max-w-xs text-sm font-medium'>
                                                {truncateText(post.content, 60)}
                                            </p>
                                        </TableCell>
                                        <TableCell className='text-sm'>{post.author?.username ?? '—'}</TableCell>
                                        <TableCell>
                                            <Badge variant='outline' className={getPostStatusColor(status)}>
                                                {t(`postStatus.${status}` as Parameters<typeof t>[0])}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className='text-sm text-muted-foreground'>
                                            {formatDateTime(post.created_at)}
                                        </TableCell>
                                        <TableCell className='text-right'>
                                            <div className='flex items-center justify-end gap-1'>
                                                <TooltipIconButton
                                                    icon={Eye}
                                                    tooltip={t('posts.actions.preview')}
                                                    onClick={() => openDialog(post, 'preview')}
                                                    disabled={isFetching}
                                                    className='text-muted-foreground hover:text-foreground'
                                                />

                                                {!post.deleted_at && (
                                                    <TooltipIconButton
                                                        icon={Trash2}
                                                        tooltip={t('posts.actions.delete')}
                                                        onClick={() => openDialog(post, 'delete')}
                                                        disabled={isFetching}
                                                        className='text-destructive hover:text-destructive hover:bg-destructive/10'
                                                    />
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                )}
            </TablePanel>

            {selectedPost && (
                <>
                    <PostPreviewDialog
                        open={dialogType === 'preview'}
                        post={selectedPost}
                        onOpenChange={(open) => !open && closeDialog()}
                    />
                    <DeletePostDialog
                        open={dialogType === 'delete'}
                        postUuid={selectedPost.uuid}
                        authorUsername={selectedPost.author?.username ?? '—'}
                        onOpenChange={(open) => !open && closeDialog()}
                        onSuccess={handleActionSuccess}
                    />
                </>
            )}
        </>
    )
}
