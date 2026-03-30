import FollowToggleButton from '@/components/follow-toggle-button'
import { useTranslations } from 'next-intl'

interface ButtonFollowProps {
    isFollowed: boolean
    onToggleFollow: () => void
    className?: string
    isAuth: boolean
}

export default function ButtonFollow({ isFollowed, onToggleFollow, className, isAuth }: ButtonFollowProps) {
    const t = useTranslations('ProfilePage.actions')
    return (
        <FollowToggleButton
            isFollowed={isFollowed}
            onToggleFollow={onToggleFollow}
            isAuth={isAuth}
            followLabel={t('follow')}
            followedLabel={t('following')}
            className={className}
            followClassName='primary-button h-10! rounded-sm! text-base! font-medium! px-8!'
            followedClassName='h-10 rounded-sm! text-base! font-medium! px-8!'
        />
    )
}
