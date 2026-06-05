'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useGetAdminPostsQuery } from '@/store/services/admin'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Trash2, Eye, Play } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AdminTableToolbar } from '@/components/admin'
import { TablePanel } from '@/components/data-display/table-panel'
import { TablePagination } from '@/components/data-display/table-pagination'
import { TableSkeleton } from '@/components/data-display/table-skeleton'
import { TooltipIconButton } from '@/components/ui/tooltip-icon-button'
import type { OffsetPaginationMeta } from '@/types/common/pagination-meta.type'
import { EmptyState } from '@/components/common/empty-state'
import { DeletePostDialog } from './delete-post-dialog'
import { PostPreviewDialog } from './post-preview-dialog'
import { truncateText } from '@/utils/admin/admin.util'
import { formatCompactNumber } from '@/utils/formatting/format-number.util'
import { formatDateShort } from '@/utils/formatting/format-time.util'
import { useAdminTableState } from '@/hooks/use-admin-table-state'
import { useDialog } from '@/hooks/use-dialog'
import { PostStatusFilter, type PostStatusFilterType, AUDIENCE_CONFIGS } from '@/constants/status/post'
import type { SortOrder } from '@/constants/ui/table'
import type { AdminPost } from '@/types/dtos/admin/admin-response.dto'
import { cn } from '@/lib/utils'

interface PostModerationTableProps {
    onPostDeleted?: () => void
}

type DialogType = 'preview' | 'delete'

function PostThumbnail({ src, alt }: { src: string | null; alt: string }) {
    return (
        <div className='relative h-14 w-10 shrink-0 overflow-hidden rounded bg-muted'>
            {src ? (
                <Image src={src} alt={alt} fill className='object-cover' sizes='40px' />
            ) : (
                <div className='flex h-full w-full items-center justify-center'>
                    <Play className='h-3.5 w-3.5 text-muted-foreground' />
                </div>
            )}
        </div>
    )
}

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
        handlePerPageChange,
    } = useAdminTableState(PostStatusFilter.ALL)

    const { selectedItem: selectedPost, dialogType, openDialog, closeDialog } = useDialog<AdminPost, DialogType>()

    const { data, isLoading, isFetching, refetch } = useGetAdminPostsQuery({
        page,
        per_page: perPage,
        q: searchTerm || undefined,
        status:
            (statusFilter as PostStatusFilterType) !== PostStatusFilter.ALL
                ? (statusFilter as PostStatusFilterType)
                : undefined,
        order_by: [sortBy === 'recent' ? '-created_at' : 'created_at'],
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
                columnWidths={['w-28 shrink-0', 'flex-1', 'w-24', 'w-16', 'w-16', 'w-24', 'w-20', 'w-20', 'w-16 ml-auto']}
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
                                    value={draftStatus as PostStatusFilterType}
                                    onValueChange={(v) => setDraftStatus(v as PostStatusFilterType)}
                                >
                                    <SelectTrigger className='filter-select w-36'>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={PostStatusFilter.ALL}>
                                            {t('posts.filters.allStatuses')}
                                        </SelectItem>
                                        <SelectItem value={PostStatusFilter.VISIBLE}>
                                            {t('posts.filters.visible')}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={draftSort} onValueChange={(v) => setDraftSort(v as SortOrder)}>
                                    <SelectTrigger className='filter-select w-32'>
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
                            pagination={pagination as OffsetPaginationMeta}
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
                    <Table dividers>
                        <TableHeader>
                            <TableRow className='hover:bg-muted/40'>
                                <TableHead className='table-head'>{t('posts.columns.video')}</TableHead>
                                <TableHead className='table-head w-28'>{t('posts.columns.creator')}</TableHead>
                                <TableHead className='table-head w-20 text-right'>{t('posts.columns.views')}</TableHead>
                                <TableHead className='table-head w-20 text-right'>{t('posts.columns.likes')}</TableHead>
                                <TableHead className='table-head w-20 text-right'>{t('posts.columns.comments')}</TableHead>
                                <TableHead className='table-head w-28'>{t('posts.columns.visibility')}</TableHead>
                                <TableHead className='table-head w-24'>{t('posts.columns.status')}</TableHead>
                                <TableHead className='text-right table-head w-20'>{t('posts.columns.actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {posts.map((post) => {
                                const isDeleted = !!post.deleted_at
                                const audienceConfig = post.audience
                                    ? AUDIENCE_CONFIGS[post.audience] ?? null
                                    : null
                                const AudienceIcon = audienceConfig?.icon

                                return (
                                    <TableRow key={post.id} className='hover:bg-muted/40 align-top'>
                                        <TableCell>
                                            <div className='flex items-start gap-3'>
                                                <PostThumbnail
                                                    src={post.thumbnail_url}
                                                    alt={post.content.slice(0, 40)}
                                                />
                                                <div className='min-w-0'>
                                                    <p className='max-w-xs text-sm font-medium leading-tight text-foreground line-clamp-2'>
                                                        {truncateText(post.content, 80)}
                                                    </p>
                                                    <p className='mt-0.5 text-xs text-muted-foreground'>
                                                        P-{post.id}
                                                        {post.created_at && (
                                                            <> · {formatDateShort(post.created_at)}</>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className='text-sm text-muted-foreground'>
                                            {post.author?.username ? `@${post.author.username}` : '—'}
                                        </TableCell>
                                        <TableCell className='text-right text-sm tabular-nums'>
                                            {formatCompactNumber(post.views_count ?? 0)}
                                        </TableCell>
                                        <TableCell className='text-right text-sm tabular-nums'>
                                            {formatCompactNumber(post.likes_count ?? 0)}
                                        </TableCell>
                                        <TableCell className='text-right text-sm tabular-nums'>
                                            {formatCompactNumber(post.comments_count ?? 0)}
                                        </TableCell>
                                        <TableCell>
                                            {audienceConfig ? (
                                                <div className='flex items-center gap-1.5 text-sm text-muted-foreground'>
                                                    {AudienceIcon && <AudienceIcon className='h-3.5 w-3.5 shrink-0' />}
                                                    <span>
                                                        {t(audienceConfig.labelKey as Parameters<typeof t>[0])}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className='text-muted-foreground'>—</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant='outline'
                                                className={cn(
                                                    'text-xs font-medium',
                                                    isDeleted
                                                        ? 'border-red-500/30 bg-red-500/10 text-red-400'
                                                        : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                                                )}
                                            >
                                                <span
                                                    className={cn(
                                                        'mr-1.5 h-1.5 w-1.5 rounded-full inline-block',
                                                        isDeleted ? 'bg-red-400' : 'bg-emerald-400'
                                                    )}
                                                />
                                                {isDeleted
                                                    ? t('posts.liveStatus.removed')
                                                    : t('posts.liveStatus.live')}
                                            </Badge>
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
