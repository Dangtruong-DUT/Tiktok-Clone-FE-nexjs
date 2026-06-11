'use client'

import { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetUserByUsernameQuery } from '@/store/services/user/user.service'
import { useGetPostOfUserPagingQuery } from '@/store/services/content/posts.service'
import { getUserStatus, getUserStatusColor } from '@/utils/admin/admin.util'
import { formatNumber } from '@/utils/formatting/format-number.util'
import { formatDateTime } from '@/utils/formatting/format-time.util'
import type { AdminUser } from '@/types/dtos/admin/admin-response.dto'
import type { OffsetPaginationMeta } from '@/types/common/pagination-meta.type'

interface UserDetailDialogProps {
    open: boolean
    user: AdminUser
    onOpenChange: (open: boolean) => void
}

export function UserDetailDialog({ open, user, onOpenChange }: UserDetailDialogProps) {
    const t = useTranslations('AdminPage')

    const { data: profileRes, isLoading: isProfileLoading } = useGetUserByUsernameQuery(user.username, {
        skip: !open
    })

    const { data: postsRes, isLoading: isPostsLoading } = useGetPostOfUserPagingQuery(
        { userId: user.uuid, page: 1 },
        { skip: !open }
    )

    const profile = profileRes?.data
    const status = useMemo(() => getUserStatus(user), [user])
    const postsTotal = (postsRes?.meta as OffsetPaginationMeta | undefined)?.total

    const displayName = profile?.name || user.username
    const fallbackAvatar = displayName.charAt(0)?.toUpperCase() || 'U'

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-[760px]'>
                <DialogHeader>
                    <DialogTitle>{t('users.detail.title')}</DialogTitle>
                </DialogHeader>

                <div className='space-y-6'>
                    <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                        <div className='flex items-center gap-4'>
                            <Avatar className='size-14'>
                                <AvatarImage src={user.avatar || undefined} alt={user.username} />
                                <AvatarFallback>{fallbackAvatar}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className='text-base font-semibold'>{displayName}</p>
                                <p className='text-sm text-muted-foreground'>@{user.username}</p>
                                <p className='text-xs text-muted-foreground'>{user.email}</p>
                            </div>
                        </div>
                        <Badge className={getUserStatusColor(status)}>
                            {t(`userStatus.${status}` as Parameters<typeof t>[0])}
                        </Badge>
                    </div>

                    <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
                        <StatCard
                            label={t('users.detail.stats.followers')}
                            value={formatNumber(profile?.followers_count ?? 0)}
                            isLoading={isProfileLoading}
                        />
                        <StatCard
                            label={t('users.detail.stats.following')}
                            value={formatNumber(profile?.following_count ?? 0)}
                            isLoading={isProfileLoading}
                        />
                        <StatCard
                            label={t('users.detail.stats.likes')}
                            value={formatNumber(profile?.likes_count ?? 0)}
                            isLoading={isProfileLoading}
                        />
                        <StatCard
                            label={t('users.detail.stats.posts')}
                            value={postsTotal != null ? formatNumber(postsTotal) : '--'}
                            isLoading={isPostsLoading}
                        />
                    </div>

                    <div className='grid grid-cols-1 gap-4 rounded-lg border bg-muted/30 p-4 text-sm sm:grid-cols-2'>
                        <DetailRow label={t('users.detail.fields.email')} value={user.email} />
                        <DetailRow label={t('users.detail.fields.createdAt')} value={formatDateTime(user.created_at)} />
                        <DetailRow label={t('users.detail.fields.role')} value={profile?.role ?? '--'} />
                        <DetailRow label={t('users.detail.fields.verify')} value={profile?.verify ?? '--'} />
                        <DetailRow
                            label={t('users.detail.fields.bannedAt')}
                            value={user.banned_at ? formatDateTime(user.banned_at) : '--'}
                        />
                        <DetailRow
                            label={t('users.detail.fields.deletedAt')}
                            value={user.deleted_at ? formatDateTime(user.deleted_at) : '--'}
                        />
                        {user.ban_duration_days != null && (
                            <DetailRow
                                label={t('users.detail.fields.banDuration')}
                                value={
                                    user.ban_duration_days === 0
                                        ? t('users.detail.values.permanent')
                                        : t('users.detail.values.days', { count: user.ban_duration_days })
                                }
                            />
                        )}
                        {user.ban_expires_at && (
                            <DetailRow
                                label={t('users.detail.fields.banExpires')}
                                value={formatDateTime(user.ban_expires_at)}
                            />
                        )}
                        <DetailRow
                            label={t('users.detail.fields.banReason')}
                            value={user.ban_reason || '--'}
                            className='sm:col-span-2'
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button size='lg' type='button' variant='outline' onClick={() => onOpenChange(false)}>
                        {t('common.cancel')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function StatCard({ label, value, isLoading }: { label: string; value: string; isLoading: boolean }) {
    return (
        <div className='rounded-lg border bg-background p-3 text-center'>
            <p className='text-xs uppercase tracking-wide text-muted-foreground'>{label}</p>
            {isLoading ? (
                <Skeleton className='mt-2 h-6 w-full' />
            ) : (
                <p className='mt-2 text-lg font-semibold'>{value}</p>
            )}
        </div>
    )
}

function DetailRow({ label, value, className }: { label: string; value: string | number; className?: string }) {
    return (
        <div className={className}>
            <p className='text-xs uppercase tracking-wide text-muted-foreground'>{label}</p>
            <p className='mt-1 font-medium text-foreground'>{value}</p>
        </div>
    )
}
