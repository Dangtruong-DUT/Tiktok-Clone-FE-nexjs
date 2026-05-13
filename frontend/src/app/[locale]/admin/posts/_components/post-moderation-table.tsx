'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useGetAdminPostsQuery } from '@/store/services/admin/admin-posts.service'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Trash2, Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Skeleton } from '@/components/ui/skeleton'
import { AdminTableToolbar, AdminTablePagination, AdminTablePanel } from '@/components/admin'
import { DeletePostDialog } from './delete-post-dialog'
import { PostPreviewDialog } from './post-preview-dialog'
import { formatAdminDate, getPostStatusColor, getPostStatus, truncateText } from '@/helpers/admin-helpers'
import type { AdminPost } from '@/types/dtos/admin/admin-response.dto'

interface PostModerationTableProps {
    onPostDeleted?: () => void
}

type PostStatusFilter = 'all' | 'visible'
type SortOrder = 'recent' | 'oldest'
type DialogType = 'preview' | 'delete'

export function PostModerationTable({ onPostDeleted }: PostModerationTableProps) {
    const t = useTranslations('AdminPage')

    const [page, setPage] = useState(1)
    const [perPage, setPerPage] = useState(10)

    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<PostStatusFilter>('all')
    const [sortBy, setSortBy] = useState<SortOrder>('recent')

    const [draftStatus, setDraftStatus] = useState<PostStatusFilter>('all')
    const [draftSort, setDraftSort] = useState<SortOrder>('recent')

    const [selectedPost, setSelectedPost] = useState<AdminPost | null>(null)
    const [dialogType, setDialogType] = useState<DialogType | null>(null)

    const { data, isLoading, isFetching, refetch } = useGetAdminPostsQuery({
        page,
        per_page: perPage,
        q: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        order_by: [sortBy === 'recent' ? '-created_at' : 'created_at']
    })

    const posts = data?.data ?? []
    const pagination = data?.meta

    const hasActiveFilters = statusFilter !== 'all' || sortBy !== 'recent'

    const handleSearch = (value: string) => {
        setSearchTerm(value)
        setStatusFilter(draftStatus)
        setSortBy(draftSort)
        setPage(1)
    }

    const handleResetFilters = () => {
        setDraftStatus('all')
        setDraftSort('recent')
        setStatusFilter('all')
        setSortBy('recent')
        setPage(1)
    }

    const openDialog = (post: AdminPost, type: DialogType) => {
        setSelectedPost(post)
        setDialogType(type)
    }

    const closeDialog = () => {
        setSelectedPost(null)
        setDialogType(null)
    }

    const handleActionSuccess = () => {
        closeDialog()
        refetch()
        onPostDeleted?.()
    }

    if (isLoading) {
        return (
            <div className='rounded-xl border bg-card shadow-xs overflow-hidden'>
                <div className='border-b border-border/50 px-4 py-2.5'>
                    <Skeleton className='h-8 w-full rounded-md' />
                </div>
                <div className='divide-y divide-border/40'>
                    <div className='bg-muted/30 px-4 py-2.5'>
                        <Skeleton className='h-3.5 w-1/2' />
                    </div>
                    {Array.from({ length: 7 }).map((_, i) => (
                        <div key={i} className='flex items-center gap-4 px-4 py-3.5'>
                            <Skeleton className='h-3.5 w-8 shrink-0' />
                            <Skeleton className='h-3.5 flex-1' />
                            <Skeleton className='h-3.5 w-24' />
                            <Skeleton className='h-5 w-16 rounded-full' />
                            <Skeleton className='h-3.5 w-24' />
                            <Skeleton className='h-7 w-16 rounded-md ml-auto' />
                        </div>
                    ))}
                </div>
                <div className='border-t border-border/50 px-4 py-2.5'>
                    <Skeleton className='h-7 w-48' />
                </div>
            </div>
        )
    }

    return (
        <TooltipProvider>
            <AdminTablePanel
                isFetching={isFetching}
                toolbar={
                    <AdminTableToolbar
                        searchValue={searchTerm}
                        onSearchChange={handleSearch}
                        searchPlaceholder={t('posts.placeholders.searchPosts')}
                        hasActiveFilters={hasActiveFilters}
                        onResetFilters={handleResetFilters}
                        resetLabel={t('common.reset')}
                        isFetching={isFetching}
                        filters={
                            <>
                                <Select value={draftStatus} onValueChange={(v) => setDraftStatus(v as PostStatusFilter)}>
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
                        <AdminTablePagination
                            pagination={pagination}
                            page={page}
                            perPage={perPage}
                            onPageChange={setPage}
                            onPerPageChange={(n) => {
                                setPerPage(n)
                                setPage(1)
                            }}
                        />
                    ) : undefined
                }
            >
                {posts.length === 0 ? (
                    <div className='py-16 text-center'>
                        <p className='text-sm text-muted-foreground'>{t('posts.emptyState')}</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className='hover:bg-muted/40'>
                                <TableHead className='text-xs font-semibold uppercase tracking-wide text-muted-foreground w-16'>
                                    {t('posts.columns.id')}
                                </TableHead>
                                <TableHead className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                                    {t('posts.columns.title')}
                                </TableHead>
                                <TableHead className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                                    {t('posts.columns.author')}
                                </TableHead>
                                <TableHead className='text-xs font-semibold uppercase tracking-wide text-muted-foreground w-28'>
                                    {t('posts.columns.status')}
                                </TableHead>
                                <TableHead className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                                    {t('posts.columns.uploadDate')}
                                </TableHead>
                                <TableHead className='text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground w-24'>
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
                                            <p className='max-w-xs truncate text-sm font-medium'>
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
                                            {formatAdminDate(post.created_at)}
                                        </TableCell>
                                        <TableCell className='text-right'>
                                            <div className='flex items-center justify-end gap-1'>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant='ghost'
                                                            size='icon'
                                                            className='h-8 w-8 text-muted-foreground hover:text-foreground'
                                                            onClick={() => openDialog(post, 'preview')}
                                                            disabled={isFetching}
                                                        >
                                                            <Eye className='h-4 w-4' />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>{t('posts.actions.preview')}</TooltipContent>
                                                </Tooltip>

                                                {!post.deleted_at && (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant='ghost'
                                                                size='icon'
                                                                className='h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10'
                                                                onClick={() => openDialog(post, 'delete')}
                                                                disabled={isFetching}
                                                            >
                                                                <Trash2 className='h-4 w-4' />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>{t('posts.actions.delete')}</TooltipContent>
                                                    </Tooltip>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                )}
            </AdminTablePanel>

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
        </TooltipProvider>
    )
}
