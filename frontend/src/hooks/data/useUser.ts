'use client'

import useDebounceCallback from '@/hooks/shared/useDebounceCallback'
import { useFollowUserMutation, useUnfollowUserMutation } from '@/store/services/user/user.service'
import { useCallback, useEffect, useState } from 'react'
import { logger } from '@/utils/logger.util'

export function useFollowUser({ userId, initialFollowState }: { userId: string; initialFollowState: boolean }) {
    const [followUser, { isLoading: isFollowLoading }] = useFollowUserMutation()
    const [unfollowUser, { isLoading: isUnfollowLoading }] = useUnfollowUserMutation()
    const [isFollowedState, setIsFollowedState] = useState(initialFollowState)
    const isProcessing = isFollowLoading || isUnfollowLoading

    useEffect(() => {
        setIsFollowedState(initialFollowState)
    }, [initialFollowState])

    const handleFollowAction = useDebounceCallback(async (isFollowedState) => {
        if (isProcessing) return

        try {
            if (!isFollowedState) {
                await unfollowUser(userId).unwrap()
            } else {
                await followUser({
                    user_uuid: userId
                }).unwrap()
            }
        } catch (error) {
            setIsFollowedState((prev) => !prev)
            logger.error(error)
        }
    }, 300)

    const onToggleFollow = useCallback(() => {
        setIsFollowedState((prev) => {
            handleFollowAction(!prev)
            return !prev
        })
    }, [handleFollowAction])

    return {
        isFollowedState,
        onToggleFollow
    }
}
