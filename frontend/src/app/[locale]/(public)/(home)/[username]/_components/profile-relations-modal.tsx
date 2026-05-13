'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import FollowToggleButton from '@/components/follow-toggle-button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import useCurrentUserData from '@/hooks/data/useCurrentUserData'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { useAppSelector } from '@/store/hooks'
import {
    useFollowUserMutation,
    useGetFollowersOfUserQuery,
    useGetFollowingOfUserQuery,
    useGetFriendsOfUserQuery,
    useGetSuggestedUsersQuery,
    useUnfollowUserMutation
} from '@/store/services/user.service'
import { UserType } from '@/types/models/user.model'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'
import { HTTP_STATUS } from '@/constants/api/http-status'

type RelationTab = 'following' | 'followers' | 'friends' | 'suggested'

type ProfileRelationsModalProps = {
    userUuid: string
    username: string
    followingCount: number
    followersCount: number
    likesCount: number
}

const PAGE_SIZE = 20

export default function ProfileRelationsModal({
    userUuid,
    username,
    followingCount,
    followersCount,
    likesCount
}: ProfileRelationsModalProps) {
    const t = useTranslations('ProfilePage')
    const role = useAppSelector((state) => state.auth.role)
    const currentUser = useCurrentUserData()
    const isAuth = role != null
    const isOwnProfile = currentUser?.uuid === userUuid

    const [isOpen, setIsOpen] = useState(false)
    const [activeTab, setActiveTab] = useState<RelationTab>('followers')
    const [processingUserUuid, setProcessingUserUuid] = useState<string | null>(null)
    const [localUsersByTab, setLocalUsersByTab] = useState<Partial<Record<RelationTab, UserType[]>>>({})
    const [optimisticFollowingCount, setOptimisticFollowingCount] = useState(followingCount)
    const [optimisticFollowersCount, setOptimisticFollowersCount] = useState(followersCount)

    const [followUser] = useFollowUserMutation()
    const [unfollowUser] = useUnfollowUserMutation()

    const followingQuery = useGetFollowingOfUserQuery(
        {
            user_uuid: userUuid,
            page: 1,
            per_page: PAGE_SIZE
        },
        {
            skip: !isOpen || activeTab !== 'following'
        }
    )

    const followersQuery = useGetFollowersOfUserQuery(
        {
            user_uuid: userUuid,
            page: 1,
            per_page: PAGE_SIZE
        },
        {
            skip: !isOpen || activeTab !== 'followers'
        }
    )

    const friendsQuery = useGetFriendsOfUserQuery(
        {
            user_uuid: userUuid,
            page: 1,
            per_page: PAGE_SIZE
        },
        {
            skip: !isOpen || activeTab !== 'friends'
        }
    )

    const suggestedQuery = useGetSuggestedUsersQuery(
        {
            page: 1,
            per_page: PAGE_SIZE
        },
        {
            skip: !isAuth || !isOwnProfile || !isOpen || activeTab !== 'suggested'
        }
    )

    useEffect(() => {
        if (!isOwnProfile && activeTab === 'suggested') {
            setActiveTab('followers')
        }
    }, [activeTab, isOwnProfile])

    useEffect(() => {
        setOptimisticFollowingCount(followingCount)
    }, [followingCount])

    useEffect(() => {
        setOptimisticFollowersCount(followersCount)
    }, [followersCount])

    const activeQuery = useMemo(() => {
        switch (activeTab) {
            case 'following':
                return followingQuery
            case 'followers':
                return followersQuery
            case 'friends':
                return friendsQuery
            case 'suggested':
                return suggestedQuery
            default:
                return followersQuery
        }
    }, [activeTab, followersQuery, followingQuery, friendsQuery, suggestedQuery])

    const serverUsers = activeQuery.data?.data ?? []
    const users = localUsersByTab[activeTab] ?? serverUsers
    const isLoading = activeQuery.isLoading
    const isPrivateData = (activeQuery.error as { status?: number } | undefined)?.status === HTTP_STATUS.FORBIDDEN

    useEffect(() => {
        if (!isOpen) {
            setLocalUsersByTab((prev) => (Object.keys(prev).length === 0 ? prev : {}))
        }
    }, [isOpen])

    useEffect(() => {
        if (!isOpen || isPrivateData || serverUsers.length === 0) {
            return
        }

        setLocalUsersByTab((prev) => {
            if (prev[activeTab]) {
                return prev
            }

            return {
                ...prev,
                [activeTab]: serverUsers
            }
        })
    }, [activeTab, isOpen, isPrivateData, serverUsers])

    const defaultFollowActionLabel = useMemo(() => {
        if (activeTab === 'followers') {
            return t('relationsModal.actions.followBack')
        }

        return t('actions.follow')
    }, [activeTab, t])

    const followedActionLabel = useMemo(() => {
        if (activeTab === 'friends') {
            return t('relationsModal.actions.friends')
        }

        return t('actions.following')
    }, [activeTab, t])

    const tabs: Array<{ key: RelationTab; label: string; count?: number }> = useMemo(() => {
        const baseTabs: Array<{ key: RelationTab; label: string; count?: number }> = [
            { key: 'following', label: t('stats.following'), count: optimisticFollowingCount },
            { key: 'followers', label: t('stats.followers'), count: optimisticFollowersCount },
            { key: 'friends', label: t('relationsModal.tabs.friends'), count: friendsQuery.data?.meta.total }
        ]

        if (isOwnProfile) {
            baseTabs.push({
                key: 'suggested',
                label: t('relationsModal.tabs.suggested'),
                count: suggestedQuery.data?.meta.total
            })
        }

        return baseTabs
    }, [
        t,
        optimisticFollowingCount,
        optimisticFollowersCount,
        friendsQuery.data?.meta.total,
        isOwnProfile,
        suggestedQuery.data?.meta.total
    ])

    const openWithTab = (tab: RelationTab) => {
        setActiveTab(tab)
        setIsOpen(true)
    }

    const handleToggleFollow = async (user: UserType) => {
        if (processingUserUuid) return

        const currentIsFollowed = user.is_followed
        const nextIsFollowed = !currentIsFollowed

        if (isOwnProfile) {
            setOptimisticFollowingCount((prev) => Math.max(0, prev + (nextIsFollowed ? 1 : -1)))
        }

        setLocalUsersByTab((prev) => ({
            ...prev,
            [activeTab]: (prev[activeTab] ?? users).map((item) =>
                item.uuid === user.uuid ? { ...item, is_followed: nextIsFollowed } : item
            )
        }))
        setProcessingUserUuid(user.uuid)
        try {
            if (currentIsFollowed) {
                await unfollowUser(user.uuid).unwrap()
            } else {
                await followUser({ user_uuid: user.uuid }).unwrap()
            }
        } catch {
            if (isOwnProfile) {
                setOptimisticFollowingCount((prev) => Math.max(0, prev + (currentIsFollowed ? 1 : -1)))
            }

            setLocalUsersByTab((prev) => ({
                ...prev,
                [activeTab]: (prev[activeTab] ?? users).map((item) =>
                    item.uuid === user.uuid ? { ...item, is_followed: currentIsFollowed } : item
                )
            }))
        } finally {
            setProcessingUserUuid(null)
        }
    }

    const renderFollowButton = (user: UserType) => {
        if (currentUser?.uuid === user.uuid) {
            return null
        }

        return (
            <FollowToggleButton
                isFollowed={user.is_followed}
                onToggleFollow={() => handleToggleFollow(user)}
                isAuth={isAuth}
                followLabel={defaultFollowActionLabel}
                followedLabel={followedActionLabel}
                className='h-9 min-w-24 px-4 text-sm font-medium'
                followClassName='bg-brand text-white hover:bg-brand/90'
                disabled={processingUserUuid === user.uuid}
            />
        )
    }

    return (
        <>
            <div className='flex items-center gap-5'>
                <button type='button' className='cursor-pointer' onClick={() => openWithTab('following')}>
                    <strong className='font-bold text-lg leading-6'>{optimisticFollowingCount}</strong>
                    <span className='text-muted-foreground font-normal text-base leading-5 inline-block ml-1.5 hover:underline'>
                        {t('stats.following')}
                    </span>
                </button>

                <button type='button' className='cursor-pointer' onClick={() => openWithTab('followers')}>
                    <strong className='font-bold text-lg leading-6'>{optimisticFollowersCount}</strong>
                    <span className='text-muted-foreground font-normal text-base leading-5 inline-block ml-1.5 hover:underline'>
                        {t('stats.followers')}
                    </span>
                </button>

                <div>
                    <strong className='font-bold text-lg leading-6'>{likesCount}</strong>
                    <span className='text-muted-foreground font-normal text-base leading-5 inline-block ml-1.5'>
                        {t('stats.likes')}
                    </span>
                </div>
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className='sm:max-w-[660px] p-0 gap-0 overflow-hidden bg-background h-[95vh] flex flex-col'>
                    <DialogTitle className='px-6 pt-4 pb-2 text-center text-2xl font-bold'>{username}</DialogTitle>

                    <div className={cn('grid border-b', tabs.length === 3 ? 'grid-cols-3' : 'grid-cols-4')}>
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                type='button'
                                className={cn('px-2 py-2 text-xs md:text-sm font-medium border-b-2 transition-colors', {
                                    'border-foreground text-foreground': activeTab === tab.key,
                                    'border-transparent text-muted-foreground hover:text-foreground':
                                        activeTab !== tab.key
                                })}
                                onClick={() => setActiveTab(tab.key)}
                            >
                                <span>{tab.label}</span>
                                {typeof tab.count === 'number' && <span className='ml-1'>{tab.count}</span>}
                            </button>
                        ))}
                    </div>

                    <div className='flex-1 overflow-y-auto px-5 py-3'>
                        {isLoading && (
                            <div className='space-y-4'>
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <div key={index} className='flex items-center justify-between gap-4'>
                                        <div className='flex items-center gap-3'>
                                            <Skeleton className='h-12 w-12 rounded-full' />
                                            <div className='space-y-2'>
                                                <Skeleton className='h-4 w-40' />
                                                <Skeleton className='h-3 w-28' />
                                            </div>
                                        </div>
                                        <Skeleton className='h-9 w-24 rounded-md' />
                                    </div>
                                ))}
                            </div>
                        )}

                        {!isLoading && isPrivateData && (
                            <div className='flex h-full min-h-[360px] items-center justify-center'>
                                <div className='text-center'>
                                    <p className='text-2xl font-semibold'>{t('relationsModal.privateTitle')}</p>
                                    <p className='mt-2 text-base text-muted-foreground'>
                                        {t('relationsModal.privateDescription')}
                                    </p>
                                </div>
                            </div>
                        )}

                        {!isLoading && !isPrivateData && users.length === 0 && (
                            <div className='flex h-full min-h-[360px] items-center justify-center'>
                                <div className='text-center'>
                                    <p className='text-2xl font-semibold'>{t('relationsModal.emptyTitle')}</p>
                                    <p className='mt-2 text-base text-muted-foreground'>{t('relationsModal.empty')}</p>
                                </div>
                            </div>
                        )}

                        {!isLoading && !isPrivateData && users.length > 0 && (
                            <div className='space-y-4'>
                                {users.map((user) => (
                                    <div key={user.uuid} className='flex items-center justify-between gap-3'>
                                        <Link
                                            href={`/@${user.username}`}
                                            onClick={() => setIsOpen(false)}
                                            className='min-w-0'
                                        >
                                            <div className='flex min-w-0 items-center gap-3'>
                                                <Avatar className='h-12 w-12'>
                                                    <AvatarImage
                                                        src={user.avatar}
                                                        alt={user.username}
                                                        className='object-cover'
                                                    />
                                                    <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <div className='min-w-0'>
                                                    <p className='truncate text-base font-semibold leading-5'>
                                                        {user.name}
                                                    </p>
                                                    <p className='truncate text-sm text-muted-foreground leading-5'>
                                                        {user.username}
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>

                                        {renderFollowButton(user)}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
