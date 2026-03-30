import { AuthModal } from '@/components/auth-modal'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type FollowToggleButtonProps = {
    isFollowed: boolean
    onToggleFollow: () => void
    isAuth: boolean
    followLabel: string
    followedLabel: string
    className?: string
    followClassName?: string
    followedClassName?: string
    disabled?: boolean
}

export default function FollowToggleButton({
    isFollowed,
    onToggleFollow,
    isAuth,
    followLabel,
    followedLabel,
    className,
    followClassName,
    followedClassName,
    disabled = false
}: FollowToggleButtonProps) {
    const buttonElement = (
        <Button
            variant={isFollowed ? 'secondary' : 'default'}
            className={cn('cursor-pointer', className, isFollowed ? followedClassName : followClassName)}
            onClick={onToggleFollow}
            disabled={disabled}
        >
            {isFollowed ? followedLabel : followLabel}
        </Button>
    )

    if (isAuth) {
        return buttonElement
    }

    return (
        <AuthModal>
            <div className='relative'>
                <button className='absolute inset-0 cursor-pointer' />
                {buttonElement}
            </div>
        </AuthModal>
    )
}
