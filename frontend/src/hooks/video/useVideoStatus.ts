'use client'

import { useCallback, useEffect, useState } from 'react'
import { TERMINAL_UPLOAD_STATUSES, VideoUploadStatus } from '@/constants/enum'
import { useGetVideoUploadStatusQuery } from '@/store/services/upload.service'
import { useAppSelector } from '@/store/hooks'

const POLL_INTERVAL_MS = 3000

export interface VideoStatusState {
    status: VideoUploadStatus
    encodingProgress: number
    hlsUrl: string | null
    isTerminal: boolean
    duration: number | null
    width: number | null
    height: number | null
    restartPolling: () => void
}

export function useVideoStatus(sessionUuid: string | null | undefined): VideoStatusState {
    const [shouldPoll, setShouldPoll] = useState(true)
    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)

    useEffect(() => {
        setShouldPoll(true)
    }, [sessionUuid])

    const { data, isError } = useGetVideoUploadStatusQuery(sessionUuid ?? '', {
        skip: !sessionUuid || !shouldPoll || !isAuthenticated,
        pollingInterval: POLL_INTERVAL_MS
    })

    const statusData = data?.data

    useEffect(() => {
        if (!statusData) return
        if (statusData.is_terminal) {
            setShouldPoll(false)
        }
    }, [statusData])

    useEffect(() => {
        if (isError) setShouldPoll(false)
    }, [isError])

    const restartPolling = useCallback(() => setShouldPoll(true), [])

    const resolvedStatus = statusData?.status ?? VideoUploadStatus.PENDING
    const isTerminal = (TERMINAL_UPLOAD_STATUSES as readonly VideoUploadStatus[]).includes(resolvedStatus)

    return {
        status: resolvedStatus,
        encodingProgress: statusData?.encoding_progress ?? 0,
        hlsUrl: statusData?.master_playlist_url ?? null,
        isTerminal,
        duration: statusData?.metadata?.duration ?? null,
        width: statusData?.metadata?.width ?? null,
        height: statusData?.metadata?.height ?? null,
        restartPolling
    }
}
