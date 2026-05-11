'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useGetAdminPostsQuery } from '@/store/services/admin/admin-posts.service'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, X, Trash2, Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import AutoPagination from '@/components/auto-pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { DeletePostDialog } from './delete-post-dialog'
import { PostPreviewDialog } from './post-preview-dialog'
import { formatAdminDate, getPostStatusColor, getPostStatus, truncateText } from '@/helpers/admin-helpers'
import { AdminPost } from '@/types/dtos/admin/admin-response.dto'

interface PostModerationTableProps {
    onPostDeleted?: () => void
}

export function PostModerationTable({ onPostDeleted }: PostModerationTableProps) {
    const t = useTranslations('AdminPage')

    const [page, setPage] = useState(1)
    const [perPage, setPerPage] = useState(10)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<'all' | 'visible'>('all')
    const [sortBy, setSortBy] = useState<'recent' | 'oldest'>('recent')
    const [selectedPost, setSelectedPost] = useState<AdminPost | null>(null)
    const [dialogType, setDialogType] = useState<'preview' | 'delete' | null>(null)

    const { data, isLoading, isFetching, refetch } = useGetAdminPostsQuery({
        page,
        per_page: perPage,
        q: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        order_by: [sortBy === 'recent' ? '-created_at' : 'created_at']
    })

    const posts = data?.data || []
    const pagination = data?.meta
    const totalItems = pagination?.total ?? posts.length

    const handleSearch = (value: string) => {
        setSearchTerm(value)
        setPage(1)
    }

    const handleStatusFilter = (value: string) => {
        setStatusFilter(value as 'all' | 'visible')
        setPage(1)
    }

    const handlePerPageChange = (value: string) => {
        setPerPage(Number(value))
        setPage(1)
    }

    const openDialog = (post: AdminPost, type: 'preview' | 'delete') => {
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
                            placeholder={t('posts.placeholders.searchPosts')}
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

                    <div className='flex gap-2'>
                        <Select value={statusFilter} onValueChange={handleStatusFilter}>
                            <SelectTrigger className='w-40'>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='all'>{t('posts.filters.allStatuses')}</SelectItem>
                                <SelectItem value='visible'>{t('posts.filters.visible')}</SelectItem>
                            </SelectContent>
                        </Select>

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
                                <SelectItem value='recent'>{t('posts.filters.recent')}</SelectItem>
                                <SelectItem value='oldest'>{t('posts.filters.oldest')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {posts.length === 0 ? (
                    <div className='rounded-xl border bg-background p-10 text-center'>
                        <p className='text-muted-foreground'>{t('posts.emptyState')}</p>
                    </div>
                ) : (
                    <div className='rounded-xl border bg-background shadow-sm overflow-hidden'>
                        <Table>
                            <TableHeader>
                                <TableRow className='bg-muted/40'>
                                    <TableHead className='text-xs uppercase tracking-wide text-muted-foreground'>
                                        {t('posts.columns.id')}
                                    </TableHead>
                                    <TableHead className='text-xs uppercase tracking-wide text-muted-foreground'>
                                        {t('posts.columns.title')}
                                    </TableHead>
                                    <TableHead className='text-xs uppercase tracking-wide text-muted-foreground'>
                                        {t('posts.columns.author')}
                                    </TableHead>
                                    <TableHead className='text-xs uppercase tracking-wide text-muted-foreground'>
                                        {t('posts.columns.status')}
                                    </TableHead>
                                    <TableHead className='text-xs uppercase tracking-wide text-muted-foreground'>
                                        {t('posts.columns.uploadDate')}
                                    </TableHead>
                                    <TableHead className='text-right text-xs uppercase tracking-wide text-muted-foreground'>
                                        {t('posts.columns.actions')}
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {posts.map((post: AdminPost) => (
                                    <TableRow key={post.id} className='hover:bg-muted/50'>
                                        <TableCell className='font-mono text-sm'>#{post.id}</TableCell>
                                        <TableCell>
                                            <p className='max-w-xs font-medium truncate'>
                                                {truncateText(post.content, 60)}
                                            </p>
                                        </TableCell>
                                        <TableCell className='font-medium'>{post.author?.username || 'N/A'}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant='outline'
                                                className={`capitalize ${getPostStatusColor(getPostStatus(post))}`}
                                            >
                                                {getPostStatus(post)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className='text-sm'>{formatAdminDate(post.created_at)}</TableCell>
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
                            authorUsername={selectedPost.author?.username || 'N/A'}
                            onOpenChange={(open) => !open && closeDialog()}
                            onSuccess={handleActionSuccess}
                        />
                    </>
                )}
            </div>
        </TooltipProvider>
    )
}
