"'use client';"
import { AuthModal } from '@/components/auth-modal'
import ShowMore from '@/components/show-more'
import { AvatarFallback, AvatarImage, Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import useCurrentUserData from '@/hooks/data/useCurrentUserData'
import { useFollowUser } from '@/hooks/data/useUser'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { useGetUserByUsernameQuery } from '@/store/services/user.service'
import { UserType } from '@/types/models/user.model'
import { timeAgo } from '@/utils/formatting/format-time.util'
import { useLocale } from 'next-intl'
import type { MentionType } from '@/types/models/mention.model'
import type { HashtagType } from '@/types/models/hashtag.model'

type VideoDescriptionProps = {
    author: UserType
    createdAt: string
    postContent: string
    mentions?: MentionType[]
    hashtags?: HashtagType[]
    className?: string
}

function FollowButton({
    isFollowedState,
    onToggleFollow,
    isAuth
}: {
    isFollowedState: boolean
    onToggleFollow: () => void
    isAuth: boolean
}) {
    const content = (
        <Button
            variant={isFollowedState ? 'outline' : 'default'}
            className={cn(' h-9!  rounded-xs! font-semibold! cursor-pointer text-base!', {
                'primary-button': !isFollowedState
            })}
            onClick={onToggleFollow}
        >
            {isFollowedState ? 'Following' : 'Follow'}
        </Button>
    )
    return isAuth ? (
        content
    ) : (
        <AuthModal>
            <div className='relative'>
                <button className='absolute inset-0' />
                {content}
            </div>
        </AuthModal>
    )
}

export default function VideoDescription({
    author,
    createdAt,
    postContent,
    mentions,
    hashtags,
    className
}: VideoDescriptionProps) {
    const locale = useLocale()
    const currentUser = useCurrentUserData()
    const isCurrentUser = currentUser?.uuid === author.uuid
    const { data: userProfileRes } = useGetUserByUsernameQuery(author.username, { skip: isCurrentUser })
    const { isFollowedState, onToggleFollow } = useFollowUser({
        userId: author.uuid,
        initialFollowState: userProfileRes?.data.is_followed ?? false
    })
    return (
        <div className={cn('p-4 rounded-lg bg-accent mt-4', className)}>
            <div className='flex items-center pb-4'>
                <Link href={`/@${author.username}`} className='flex items-center'>
                    <Avatar className='w-12 h-12  mr-3'>
                        <AvatarImage src={author.avatar} alt={author.name} className='shrink-0 object-cover' />
                        <AvatarFallback>{author.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>

                    <div className='mr-12'>
                        <h3 className='text-lg font-semibold hover:underline'>{author.username}</h3>
                        <p className='text-sm text-muted-foreground'>
                            {author.name} · {timeAgo({ locale, date: createdAt })}
                        </p>
                    </div>
                </Link>
                {!isCurrentUser && (
                    <FollowButton
                        isFollowedState={isFollowedState}
                        onToggleFollow={onToggleFollow}
                        isAuth={!!currentUser}
                    />
                )}
            </div>
            <ShowMore
                text={postContent}
                mentions={mentions}
                hashtags={hashtags}
                className='text-base'
                maxHeight={42}
                enableRichText
            />
        </div>
    )
}
