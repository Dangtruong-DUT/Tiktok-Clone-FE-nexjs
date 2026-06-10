'use client'

import { useCallback, useMemo, useState } from 'react'
import Image from 'next/image'
import DialogHeader from '@/components/ui/modal-header'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useLocale, useTranslations } from 'next-intl'
import { BellRing, MessageCircle, ShieldCheck, Sparkles, Video } from 'lucide-react'
import { cn } from '@/lib/utils'
import { timeAgo } from '@/utils/formatting/format-time.util'
import { NotificationTypeCode } from '@/constants/enum'
import { useDrawerSidebar } from '@/app/[locale]/(public)/(home)/_components/sidebar/_components/drawer/drawer'
import {
    useGetNotificationsInfiniteQuery,
    useMarkAllAsReadMutation,
    useMarkAsReadMutation
} from '@/store/services/notification.service'
import { NotificationTabType } from '@/types/dtos/notification/notification-request.dto'
import { NotificationType } from '@/types/models/notification.model'
import { useFollowUserMutation, useUnfollowUserMutation } from '@/store/services/user.service'
import FollowToggleButton from '@/components/public/follow-toggle-button'
import { useAppSelector } from '@/store/hooks'
import { APP_ROUTES, USER_ROUTES } from '@/constants/routes/routes'

import LoadingIcon from '@/components/lottie-icons/loading'

type NotificationSection = 'new' | 'this_week' | 'this_month' | 'previous'

type GroupedNotification = {
    section: NotificationSection
    items: NotificationType[]
}

const TABS: Array<{ key: NotificationTabType; i18n: string }> = [
    { key: 'all', i18n: 'tabs.all' },
    { key: 'likes', i18n: 'tabs.likes' },
    { key: 'comments', i18n: 'tabs.comments' },
    { key: 'mentions', i18n: 'tabs.mentions' },
    { key: 'followers', i18n: 'tabs.followers' }
]

function groupNotifications(notifications: NotificationType[]): GroupedNotification[] {
    const now = Date.now()

    const sections: Record<NotificationSection, NotificationType[]> = {
        new: [],
        this_week: [],
        this_month: [],
        previous: []
    }

    notifications.forEach((notification) => {
        if (!notification.is_read) {
            sections.new.push(notification)
            return
        }

        const createdAt = new Date(notification.created_at).getTime()
        const daysDiff = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24))

        if (daysDiff <= 7) {
            sections.this_week.push(notification)
            return
        }

        if (daysDiff <= 31) {
            sections.this_month.push(notification)
            return
        }

        sections.previous.push(notification)
    })

    return Object.entries(sections)
        .filter(([, items]) => items.length > 0)
        .map(([section, items]) => ({
            section: section as NotificationSection,
            items
        }))
}

function getNotificationMessage(
    notification: NotificationType,
    t: (key: string, values?: Record<string, string | number>) => string
): string {
    const actorName = notification.actor?.name || notification.actor?.username || t('labels.someone')
    const event = typeof notification.data?.event === 'string' ? notification.data.event : ''
    const action = typeof notification.data?.action === 'string' ? notification.data.action : ''
    const likedTargetType =
        typeof notification.data?.liked_target_type === 'string' ? notification.data.liked_target_type : ''

    if (notification.type === NotificationTypeCode.LIKE) {
        if (likedTargetType === 'comment') {
            return t('messages.likeComment', { actor: actorName })
        }

        return t('messages.like', { actor: actorName })
    }

    if (notification.type === NotificationTypeCode.COMMENT) {
        return t('messages.comment', { actor: actorName })
    }

    if (notification.type === NotificationTypeCode.MENTION) {
        return t('messages.mention', { actor: actorName })
    }

    if (notification.type === NotificationTypeCode.FOLLOW) {
        return t('messages.follow', { actor: actorName })
    }

    if (notification.type === NotificationTypeCode.SECURITY) {
        if (event === 'login') {
            return t('messages.authLogin')
        }

        if (event === 'register') {
            return t('messages.authRegister')
        }

        if (event.includes('ai')) {
            return t('messages.aiNotice')
        }
    }

    if (notification.type === NotificationTypeCode.ADMIN) {
        const systemLabel = t('labels.system')

        if (action === 'ban_user') {
            return t('messages.adminBan', { actor: systemLabel })
        }

        if (action === 'delete_post') {
            return t('messages.adminDeletePost', { actor: systemLabel })
        }

        if (action === 'delete_comment') {
            return t('messages.adminDeleteComment', { actor: systemLabel })
        }

        if (action === 'approve_appeal') {
            return t('messages.appealApproved', { actor: systemLabel })
        }

        if (action === 'reject_appeal') {
            return t('messages.appealRejected', { actor: systemLabel })
        }

        return t('messages.adminNotice', { actor: systemLabel })
    }

    return t('messages.default', { actor: actorName })
}

function getNotificationSubText(notification: NotificationType): string | null {
    const commentExcerpt = notification.data?.comment_excerpt || notification.data?.content_excerpt
    if (typeof commentExcerpt === 'string' && commentExcerpt.trim() !== '') {
        return commentExcerpt
    }
    return null
}

function getNotificationLink(notification: NotificationType): string | null {
    const action = typeof notification.data?.action === 'string' ? notification.data.action : ''
    const blockedActions = new Set(['unban', 'unban_user', 'restore_user', 'restore_post', 'restore_comment'])

    if (notification.type === NotificationTypeCode.ADMIN && blockedActions.has(action)) {
        return null
    }

    if (
        notification.type === NotificationTypeCode.ADMIN &&
        (action === 'approve_appeal' || action === 'reject_appeal')
    ) {
        const appealUuid = typeof notification.data?.appeal_uuid === 'string' ? notification.data.appeal_uuid : null
        return appealUuid ? `${APP_ROUTES.APPEAL}?appeal_uuid=${appealUuid}` : null
    }

    const appealAvailable = notification.data?.appeal_available === true
    const appealType = typeof notification.data?.appeal_type === 'string' ? notification.data.appeal_type : null
    const resourceType = typeof notification.data?.resource_type === 'string' ? notification.data.resource_type : null
    const resourceUuid = typeof notification.data?.resource_uuid === 'string' ? notification.data.resource_uuid : null
    const appealLink = typeof notification.data?.appeal_link === 'string' ? notification.data.appeal_link : null

    if (appealAvailable && appealType && resourceType && resourceUuid !== null) {
        return `${APP_ROUTES.APPEAL}?appeal_type=${appealType}&resource_type=${resourceType}&resource_uuid=${resourceUuid}`
    }

    if (appealLink) {
        try {
            const parsed = new URL(appealLink)
            const pathWithQuery = `${parsed.pathname}${parsed.search}`
            return pathWithQuery.replace(/^\/(en|vi)/, '') || '/'
        } catch {
            return appealLink.replace(/^https?:\/\/[^/]+/, '').replace(/^\/(en|vi)/, '') || '/'
        }
    }

    const dataPostUuid = typeof notification.data?.post_uuid === 'string' ? notification.data.post_uuid : null
    const dataCommentUuid = typeof notification.data?.comment_uuid === 'string' ? notification.data.comment_uuid : null

    if (
        [NotificationTypeCode.COMMENT, NotificationTypeCode.MENTION, NotificationTypeCode.LIKE].includes(
            notification.type
        ) &&
        dataPostUuid &&
        notification.actor?.username
    ) {
        const query = dataCommentUuid ? `?comment_uuid=${dataCommentUuid}` : ''
        return `${USER_ROUTES.VIDEO(notification.actor.username, dataPostUuid)}${query}`
    }

    if (notification.entity?.type === 'post' && notification.entity?.uuid && notification.actor?.username) {
        return USER_ROUTES.VIDEO(notification.actor.username, notification.entity.uuid)
    }

    if (notification.actor?.username) {
        return USER_ROUTES.PROFILE(notification.actor.username)
    }

    return null
}

function getSystemIcon(type: number) {
    if (type === NotificationTypeCode.SECURITY) {
        return ShieldCheck
    }

    if (type === NotificationTypeCode.ADMIN) {
        return Sparkles
    }

    return BellRing
}

function getPreviewBadgeIcon(type: number) {
    if (type === NotificationTypeCode.COMMENT) {
        return MessageCircle
    }

    return Video
}

function AdminEntityPreview({ notification }: { notification: NotificationType }) {
    const action = typeof notification.data?.action === 'string' ? notification.data.action : ''
    const entity = notification.entity

    if (!entity) return null

    if (action === 'delete_post' && entity.thumbnail_url) {
        return (
            <div className='relative h-16 aspect-[9/16] overflow-hidden rounded-lg bg-muted shrink-0'>
                <Image src={entity.thumbnail_url} alt='post' fill sizes='36px' className='object-cover' />
                <span className='absolute bottom-1 right-1 flex size-5 items-center justify-center rounded-full bg-black/65 text-white'>
                    <Video size={12} />
                </span>
            </div>
        )
    }

    if (action === 'delete_comment' && (entity.content || notification.data?.comment_excerpt)) {
        const text =
            entity.content ||
            (typeof notification.data?.comment_excerpt === 'string' ? notification.data.comment_excerpt : '')
        return (
            <div className='shrink-0 max-w-[100px] rounded-lg border border-border/50 bg-muted/60 px-2 py-1.5'>
                <div className='flex items-center gap-1 mb-0.5'>
                    <MessageCircle size={10} className='text-muted-foreground' />
                </div>
                <p className='text-xs text-muted-foreground line-clamp-2 leading-tight'>{text}</p>
            </div>
        )
    }

    if ((action === 'ban_user' || action === 'unban_user') && (entity.avatar || entity.username)) {
        return (
            <div className='flex shrink-0 flex-col items-center gap-1'>
                <Avatar className='size-10'>
                    <AvatarImage src={entity.avatar ?? undefined} />
                    <AvatarFallback className='text-xs'>{(entity.username?.[0] || 'U').toUpperCase()}</AvatarFallback>
                </Avatar>
                {entity.username && (
                    <span className='text-xs text-muted-foreground max-w-[60px] truncate'>@{entity.username}</span>
                )}
            </div>
        )
    }

    return null
}

type NotificationItemProps = {
    notification: NotificationType
    locale: 'en' | 'vi'
    isAuth: boolean
    isFollowed: boolean
    onToggleFollow: (notification: NotificationType) => Promise<void>
    onMarkRead: (notification: NotificationType) => Promise<void>
    onNavigate: (path: string) => void
    t: (key: string, values?: Record<string, string | number>) => string
}

function NotificationItem({
    notification,
    locale,
    isAuth,
    isFollowed,
    onToggleFollow,
    onMarkRead,
    onNavigate,
    t
}: NotificationItemProps) {
    const link = getNotificationLink(notification)
    const subText = getNotificationSubText(notification)
    const actionText = `${getNotificationMessage(notification, t)} ${timeAgo({
        locale,
        date: notification.created_at
    })}`
    const isFollowNotification = notification.type === NotificationTypeCode.FOLLOW
    const isAdminNotification = notification.type === NotificationTypeCode.ADMIN
    const isSystemNotification = [
        NotificationTypeCode.SYSTEM,
        NotificationTypeCode.ADMIN,
        NotificationTypeCode.SECURITY
    ].includes(notification.type)
    const SystemIcon = getSystemIcon(notification.type)
    const PreviewBadgeIcon = getPreviewBadgeIcon(notification.type)
    const showThumbnail = !isFollowNotification && !isAdminNotification && !!notification.entity?.thumbnail_url

    const content = (
        <>
            <div className='flex min-w-0 flex-1 items-start gap-2.5'>
                {isSystemNotification ? (
                    <div className='flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground'>
                        <SystemIcon size={18} />
                    </div>
                ) : (
                    <Avatar className='size-10'>
                        <AvatarImage src={notification.actor?.avatar ?? undefined} />
                        <AvatarFallback>{(notification.actor?.username?.[0] || 'U').toUpperCase()}</AvatarFallback>
                    </Avatar>
                )}

                <div className='min-w-0 flex-1'>
                    <p className='text-sm leading-5 text-foreground line-clamp-2'>{actionText}</p>
                    {subText && <p className='mt-1 text-xs text-muted-foreground line-clamp-1'>{subText}</p>}
                </div>
            </div>

            <div className='ml-2 flex items-center'>
                {isFollowNotification ? (
                    <div onClick={(e) => e.stopPropagation()}>
                        <FollowToggleButton
                            isFollowed={isFollowed}
                            onToggleFollow={() => onToggleFollow(notification)}
                            isAuth={isAuth}
                            followLabel={t('actions.followBack')}
                            followedLabel={t('actions.friends')}
                            className='h-8 min-w-24 rounded-xl px-3 text-xs font-semibold'
                            followClassName='bg-[#FF2D55] text-white hover:bg-[#ff2d55]/90'
                        />
                    </div>
                ) : isAdminNotification ? (
                    <AdminEntityPreview notification={notification} />
                ) : showThumbnail ? (
                    <div className='relative h-16 aspect-[9/16] overflow-hidden rounded-lg bg-muted'>
                        <Image
                            src={notification.entity?.thumbnail_url ?? ''}
                            alt='notification-thumbnail'
                            fill
                            sizes='36px'
                            className='object-cover'
                        />
                        {!isSystemNotification && (
                            <span className='absolute bottom-1 right-1 flex size-5 items-center justify-center rounded-full bg-black/65 text-white'>
                                <PreviewBadgeIcon size={12} />
                            </span>
                        )}
                    </div>
                ) : null}
            </div>
        </>
    )

    const itemClassName = cn(
        'relative flex items-center justify-between gap-2 px-3 py-2.5 transition-colors hover:bg-accent',
        !notification.is_read && 'bg-muted/40'
    )

    if (link) {
        const handleClickItem = async () => {
            await onMarkRead(notification)
            onNavigate(link)
        }

        return (
            <button
                key={notification.uuid}
                type='button'
                onClick={handleClickItem}
                className={cn(itemClassName, 'w-full text-left cursor-pointer')}
            >
                {!notification.is_read && (
                    <span className='absolute left-1 top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-brand' />
                )}
                {content}
            </button>
        )
    }

    return (
        <button
            key={notification.uuid}
            type='button'
            onClick={() => onMarkRead(notification)}
            className={cn(itemClassName, 'w-full text-left cursor-pointer')}
        >
            {!notification.is_read && (
                <span className='absolute left-1 top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-brand' />
            )}
            {content}
        </button>
    )
}

export default function ActivityDrawerContent() {
    const t = useTranslations('HomePage.sidebar.activity')
    const translate = (key: string, values?: Record<string, string | number>) => t(key as never, values as never)
    const locale = useLocale()
    const { toggleDrawer } = useDrawerSidebar()
    const role = useAppSelector((state) => state.auth.role)
    const isAuth = role != null

    const [activeTab, setActiveTab] = useState<NotificationTabType>('all')
    const [localFollowState, setLocalFollowState] = useState<Record<string, boolean>>({})

    const { data, isLoading, isFetching, fetchNextPage, hasNextPage } = useGetNotificationsInfiniteQuery({
        tab: activeTab
    })
    const [markAsRead] = useMarkAsReadMutation()
    const [markAllAsRead, { isLoading: isMarkAllLoading }] = useMarkAllAsReadMutation()
    const [followUser] = useFollowUserMutation()
    const [unfollowUser] = useUnfollowUserMutation()

    const notifications = useMemo(() => {
        return data?.pages.flatMap((page) => page.data) ?? []
    }, [data])

    const groupedNotifications = useMemo(() => groupNotifications(notifications), [notifications])

    const handleMarkAllRead = useCallback(async () => {
        await markAllAsRead({ tab: activeTab })
    }, [activeTab, markAllAsRead])

    const handleMarkRead = useCallback(
        async (notification: NotificationType) => {
            if (!notification.is_read) {
                await markAsRead(notification.uuid)
            }
        },
        [markAsRead]
    )

    const handleToggleFollow = useCallback(
        async (notification: NotificationType) => {
            const actorUuid = notification.actor?.uuid
            if (!actorUuid) return

            const currentState = localFollowState[actorUuid] ?? notification.actor?.is_followed ?? false
            const nextState = !currentState

            setLocalFollowState((prev) => ({
                ...prev,
                [actorUuid]: nextState
            }))

            try {
                if (currentState) {
                    await unfollowUser(actorUuid).unwrap()
                } else {
                    await followUser({ user_uuid: actorUuid }).unwrap()
                }
            } catch {
                setLocalFollowState((prev) => ({
                    ...prev,
                    [actorUuid]: currentState
                }))
            }
        },
        [followUser, localFollowState, unfollowUser]
    )

    const handleNavigate = useCallback(
        (path: string) => {
            window.open(`/${locale}${path}`, '_blank')
            toggleDrawer()
        },
        [locale, toggleDrawer]
    )

    return (
        <div className='w-full h-full flex flex-col'>
            <DialogHeader title={t('title')} onClose={toggleDrawer} />

            <div className='mt-3 flex flex-wrap gap-1.5 px-2'>
                {TABS.map((tab) => {
                    const isActive = activeTab === tab.key
                    return (
                        <button
                            key={tab.key}
                            className={cn(
                                'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer',
                                isActive ? 'bg-foreground text-background' : 'bg-input text-foreground hover:bg-accent'
                            )}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            {translate(tab.i18n)}
                        </button>
                    )
                })}
            </div>

            <div className='mt-2 flex items-center justify-between px-2'>
                <div className='text-sm text-muted-foreground'>
                    {t('labels.total', { count: notifications.length })}
                </div>
                <Button
                    variant='ghost'
                    className='h-7 px-2 text-xs cursor-pointer'
                    onClick={handleMarkAllRead}
                    disabled={isMarkAllLoading || notifications.length === 0}
                >
                    {isMarkAllLoading ? <LoadingIcon className='size-5' loop /> : t('actions.markAllRead')}
                </Button>
            </div>

            <div className='mt-2 flex-1 overflow-y-auto scrollbar-hidden'>
                {isLoading && (
                    <div className='flex items-center justify-center py-8 text-muted-foreground'>
                        <LoadingIcon className='size-8' loop />
                    </div>
                )}

                {!isLoading && groupedNotifications.length === 0 && (
                    <div className='px-3 py-10 text-center text-muted-foreground'>{t('empty')}</div>
                )}

                {groupedNotifications.map((group) => (
                    <section key={group.section} className='mb-4'>
                        <h4 className='px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                            {t(`sections.${group.section}`)}
                        </h4>

                        <div className='space-y-0.5'>
                            {group.items.map((notification) => {
                                const isFollowed =
                                    notification.actor?.uuid != null
                                        ? (localFollowState[notification.actor.uuid] ??
                                          notification.actor?.is_followed ??
                                          false)
                                        : false
                                return (
                                    <NotificationItem
                                        key={notification.uuid}
                                        notification={notification}
                                        locale={locale}
                                        isAuth={isAuth}
                                        isFollowed={isFollowed}
                                        onToggleFollow={handleToggleFollow}
                                        onMarkRead={handleMarkRead}
                                        onNavigate={handleNavigate}
                                        t={translate}
                                    />
                                )
                            })}
                        </div>
                    </section>
                ))}

                {hasNextPage && (
                    <div className='px-3 py-3'>
                        <Button
                            variant='ghost'
                            className='w-full cursor-pointer'
                            onClick={() => fetchNextPage()}
                            disabled={isFetching}
                        >
                            {isFetching ? <LoadingIcon className='size-6' loop /> : t('actions.loadMore')}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
