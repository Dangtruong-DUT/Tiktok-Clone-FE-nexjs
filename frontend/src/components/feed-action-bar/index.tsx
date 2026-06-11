'use client'

import React, { useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Check, Plus } from 'lucide-react'
import { FaBookmark, FaHeart, FaShare } from 'react-icons/fa6'
import LikedIcon from '@/components/lottie-icons/liked-icon'
import BookmarkIcon from '@/components/lottie-icons/bookmark-icon'
import { TikTokPostType } from '@/types/models/post.model'
import { AiFillMessage } from 'react-icons/ai'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { Link, usePathname } from '@/i18n/navigation'
import { closeModal, setOpenModal } from '@/store/features/modalSlide'
import { useGetUserByUsernameQuery } from '@/store/services/user/user.service'
import { useFollowUser } from '@/hooks/data/useUser'
import { AuthModal } from '@/components/auth-modal'
import { useBookmarkPost, useLikePost } from '@/hooks/data/useVideo'
import useCurrentUserData from '@/hooks/data/useCurrentUserData'
import ActionButton from '@/components/feed-action-bar/action-button'
import { ShareMenuDialog } from '@/components/public/share-menu-dialog'
import { useAnimatedState } from '@/hooks/ui/useAnimatedState'
import envConfig from '@/config/app.config'
import { useLocale } from 'use-intl'
import { ModalVideoDetailType } from '@/constants/ui/video-dialog'
import { USER_ROUTES } from '@/constants/routes/routes'
interface ActionBarProps {
    post: TikTokPostType
    className?: string
}

export default function ActionBar({ post, className }: ActionBarProps) {
    const { author } = post
    const currentUser = useCurrentUserData()
    const isCurrentUser = currentUser?.uuid === author.uuid

    const { data: userData } = useGetUserByUsernameQuery(author.username)
    const fetchedAuthor = userData?.data
    const openModalVideoDetailType = useAppSelector((state) => state.modal.typeOpenModal)
    const dispatch = useAppDispatch()

    const pathname = usePathname()

    const { isFollowedState, onToggleFollow } = useFollowUser({
        userId: fetchedAuthor?.uuid ?? author.uuid,
        initialFollowState: fetchedAuthor?.is_followed ?? author.is_followed
    })

    const { isAnimating: isOpenAnimatingLike, trigger: triggerLikeAnimation } = useAnimatedState()
    const { isLikedState, toggleLikeState } = useLikePost({
        postId: post.uuid,
        initialLikeState: post.is_liked,
        onLiked: triggerLikeAnimation
    })

    const { isAnimating: isOpenAnimatingBookmark, trigger: triggerBookmarkAnimation } = useAnimatedState()
    const { isBookmarkedState, toggleBookmarkState } = useBookmarkPost({
        postId: post.uuid,
        initialBookmarkState: post.is_bookmarked,
        onBookmarked: triggerBookmarkAnimation
    })

    const handleToggleOpenComment = useCallback(() => {
        if (openModalVideoDetailType === ModalVideoDetailType.COMMENTS) {
            dispatch(closeModal())
        } else {
            dispatch(setOpenModal({ prevPathname: pathname, type: ModalVideoDetailType.COMMENTS }))
        }
    }, [openModalVideoDetailType, dispatch, pathname])

    const local = useLocale()
    const videoUrl = `${envConfig.NEXT_PUBLIC_URL}${local}${USER_ROUTES.VIDEO(author.username, post.uuid)}`

    return (
        <section className={cn('flex flex-col items-center gap-3  relative', className)}>
            <div className='flex flex-col items-center text-5xl'>
                <Link href={USER_ROUTES.PROFILE(fetchedAuthor?.username ?? author.username)}>
                    <Avatar className='w-[1em] h-[1em] shrink-0'>
                        <AvatarImage
                            src={fetchedAuthor?.avatar ?? author.avatar}
                            alt={fetchedAuthor?.avatar ?? author.username}
                            className='shrink-0 object-cover'
                        />
                        <AvatarFallback className='text-sm font-medium'>
                            {(fetchedAuthor?.name ?? author.name).substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                </Link>
                {currentUser ? (
                    !isCurrentUser && (
                        <Button
                            variant='secondary'
                            onClick={onToggleFollow}
                            className={cn(
                                'relative mt-[-0.7rem] w-6 h-6 flex items-center text-white justify-center rounded-full bg-brand hover:bg-brand/90',
                                'border border-brand/10 cursor-pointer',
                                isFollowedState && 'text-brand bg-accent hover:bg-accent/90'
                            )}
                        >
                            {isFollowedState ? <Check className=' w-3 h-3' /> : <Plus className=' w-3 h-3' />}
                        </Button>
                    )
                ) : (
                    <AuthModal>
                        <Button
                            variant='secondary'
                            className={cn(
                                'relative mt-[-0.7rem] w-6 h-6 flex items-center text-white justify-center rounded-full bg-brand hover:bg-brand/90',
                                'border border-brand/10 cursor-pointer'
                            )}
                        >
                            <Plus className=' w-3 h-3' />
                        </Button>
                    </AuthModal>
                )}
            </div>
            <div className='flex flex-col items-center gap-6'>
                <ActionButton
                    icon={
                        isLikedState ? (
                            isOpenAnimatingLike ? (
                                <LikedIcon className='absolute size-[1.5em]! ' />
                            ) : (
                                <FaHeart className='size-[0.5em] text-red-500  ' />
                            )
                        ) : (
                            <FaHeart className='size-[0.5em]' />
                        )
                    }
                    count={post.likes_count}
                    label='Like'
                    onClick={toggleLikeState}
                    className={isLikedState ? 'text-red-500' : ''}
                    isAuth={!!currentUser}
                    requiredAuth
                />

                <ActionButton
                    icon={<AiFillMessage className='size-[0.5em]' />}
                    count={post.comments_count}
                    label='Comment'
                    onClick={handleToggleOpenComment}
                />
                <ActionButton
                    icon={
                        isBookmarkedState ? (
                            isOpenAnimatingBookmark ? (
                                <BookmarkIcon className=' absolute size-[0.8em]!' />
                            ) : (
                                <FaBookmark className='size-[0.5em] text-yellow-500' />
                            )
                        ) : (
                            <FaBookmark className='size-[0.5em]' />
                        )
                    }
                    count={post.bookmarks_count}
                    label='Save'
                    onClick={toggleBookmarkState}
                    isAuth={!!currentUser}
                    requiredAuth
                />
                <ShareMenuDialog url={videoUrl}>
                    <ActionButton
                        icon={<FaShare className='size-[0.5em]' />}
                        count={post.quote_post_count + post.repost_count}
                        label='Share'
                    />
                </ShareMenuDialog>
            </div>
        </section>
    )
}
