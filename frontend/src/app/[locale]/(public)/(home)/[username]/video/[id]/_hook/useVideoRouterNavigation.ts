'use client'

import { useCallback } from 'react'
import { useVideoPlaylist } from '@/app/[locale]/(public)/(home)/[username]/video/[id]/_context/video-playlist-context'
import { useRouter } from '@/i18n/navigation'
import { USER_ROUTES } from '@/constants/routes/routes'

interface UseVideoRouterNavigationProps {
    onVideoEnd?: () => void
    autoPlayNext?: boolean
}

export function useVideoRouterNavigation({ onVideoEnd }: UseVideoRouterNavigationProps = {}) {
    const router = useRouter()
    const { playlist, currentIndex, isFirstVideo, isLastVideo, currentVideo } = useVideoPlaylist()
    const navigateToVideo = useCallback(
        (targetIndex: number) => {
            if (targetIndex >= 0 && targetIndex < playlist.length) {
                const targetVideo = playlist[targetIndex]
                const newUrl = USER_ROUTES.VIDEO(targetVideo?.author.username ?? '', targetVideo?.uuid ?? '')
                router.replace(newUrl)
            }
        },
        [playlist, router]
    )

    const navigateToVideoById = useCallback(
        (videoId: string) => {
            const targetVideo = playlist.find((item) => item.uuid === videoId)
            if (targetVideo) {
                const newUrl = USER_ROUTES.VIDEO(targetVideo?.author.username ?? '', targetVideo?.uuid ?? '')
                router.replace(newUrl)
            }
        },
        [playlist, router]
    )

    const handleVideoEnd = useCallback(() => {
        onVideoEnd?.()
    }, [onVideoEnd])

    const handleNext = useCallback(() => {
        if (!isLastVideo) {
            navigateToVideo(currentIndex + 1)
        }
    }, [isLastVideo, currentIndex, navigateToVideo])

    const handlePrevious = useCallback(() => {
        if (!isFirstVideo) {
            navigateToVideo(currentIndex - 1)
        }
    }, [isFirstVideo, currentIndex, navigateToVideo])

    return {
        currentIndex,
        currentVideo,
        isFirstVideo,
        isLastVideo,
        handleNext,
        handlePrevious,
        handleVideoEnd,
        navigateToVideo,
        navigateToVideoById,
        canGoNext: !isLastVideo,
        canGoPrevious: !isFirstVideo
    }
}
