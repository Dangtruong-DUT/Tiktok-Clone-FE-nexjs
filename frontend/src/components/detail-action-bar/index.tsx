'use client'

import React, { useCallback, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { FaBookmark, FaHeart, FaShare } from 'react-icons/fa6'
import LikedIcon from '@/components/lottie-icons/liked-icon'
import BookmarkIcon from '@/components/lottie-icons/bookmark-icon'
import { TikTokPostType } from '@/types/models/post.model'
import { AiFillMessage } from 'react-icons/ai'
import { useBookmarkPost, useLikePost } from '@/hooks/data/useVideo'
import { useGetPostDetailQuery } from '@/store/services/posts.service'
import ActionButton from '@/components/detail-action-bar/action-button'
import { useAppSelector } from '@/store/hooks'
import { useAnimatedState } from '@/hooks/ui/useAnimatedState'
import envConfig from '@/config/app.config'
import { ShareMenuDialog } from '@/components/public/share-menu-dialog'
import { useLocale } from 'use-intl'

interface ActionBarProps {
    post: TikTokPostType
    className?: string
}

export default function ActionBar({ post, className }: ActionBarProps) {
    const { data: postDetailRes } = useGetPostDetailQuery(post.uuid)
    const postDetail = postDetailRes?.data

    const role = useAppSelector((state) => state.auth.role)

    const { isAnimating: isOpenAnimatingLike, trigger: triggerLikeAnimation } = useAnimatedState()
    const { isLikedState, toggleLikeState } = useLikePost({
        postId: post.uuid,
        initialLikeState: postDetail?.is_liked || false,
        onLiked: triggerLikeAnimation
    })

    const { isAnimating: isOpenAnimatingBookmark, trigger: triggerBookmarkAnimation } = useAnimatedState()
    const { isBookmarkedState, toggleBookmarkState } = useBookmarkPost({
        postId: post.uuid,
        initialBookmarkState: postDetail?.is_bookmarked || false,
        onBookmarked: triggerBookmarkAnimation
    })

    const handleOpenComment = useCallback(() => {
        const commentSection = document.getElementById(`comment-section-${post.uuid}`)
        if (commentSection) {
            commentSection.scrollIntoView({ behavior: 'smooth' })
        }
    }, [post.uuid])

    const shares_count = useMemo(() => {
        if (postDetail) return postDetail.quote_post_count + postDetail.repost_count
        return post.quote_post_count + post.repost_count
    }, [postDetail, post])

    const local = useLocale()
    const videoUrl = `${envConfig.NEXT_PUBLIC_URL}${local}/@${post.author.username}/video/${post.uuid}`

    return (
        <section className={cn('flex flex-col items-center relative', className)}>
            <ActionButton
                icon={
                    isLikedState ? (
                        isOpenAnimatingLike ? (
                            <LikedIcon className='absolute size-[1.5em]! ' />
                        ) : (
                            <FaHeart className='size-[0.5em] text-red-500' />
                        )
                    ) : (
                        <FaHeart className='size-[0.5em]' />
                    )
                }
                count={postDetail?.likes_count ?? post.likes_count}
                label='Like'
                onClick={toggleLikeState}
                isAuth={role != null}
                requiredAuth
            />

            <ActionButton
                icon={<AiFillMessage className='size-[0.5em]' />}
                count={postDetail?.comments_count ?? post.comments_count}
                label='Comment'
                onClick={handleOpenComment}
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
                        <FaBookmark className='size-[0.5em] ' />
                    )
                }
                count={postDetail?.bookmarks_count ?? post.bookmarks_count}
                label='Save'
                onClick={toggleBookmarkState}
                requiredAuth
                isAuth={role != null}
            />

            <ShareMenuDialog url={videoUrl}>
                <ActionButton icon={<FaShare className='size-[0.5em]' />} count={shares_count} label='Share' />
            </ShareMenuDialog>
        </section>
    )
}
