'use client'

import { useCallback, useEffect, useState } from 'react'
import { EncodingStatus, MediaType } from '@/constants/enum'
import { useGetVideoEncodingStatusQuery } from '@/store/services/content/upload.service'

const POLL_INTERVAL_MS = 3000

export interface VideoEncodingState {
    status: EncodingStatus
    progress: number
    hlsUrl: string | null
    isTerminal: boolean
    mediaType: MediaType
    width: number | null
    height: number | null
    duration: number | null
    restartPolling: () => void
}

function isTerminalStatus(status: EncodingStatus): boolean {
    return status === EncodingStatus.READY || status === EncodingStatus.FAILED
}

export function useVideoEncoding(fileUuid: string | null | undefined): VideoEncodingState {
    const [shouldPoll, setShouldPoll] = useState(true)

    useEffect(() => {
        setShouldPoll(true)
    }, [fileUuid])

    const { data, isError } = useGetVideoEncodingStatusQuery(fileUuid ?? '', {
        skip: !fileUuid || !shouldPoll,
        pollingInterval: POLL_INTERVAL_MS
    })

    useEffect(() => {
        if (!data) return
        if (isTerminalStatus(data.data.status)) {
            setShouldPoll(false)
        }
    }, [data])

    useEffect(() => {
        if (isError) setShouldPoll(false)
    }, [isError])

    const restartPolling = useCallback(() => setShouldPoll(true), [])

    const { status, progress, master_playlist_url, width, height, duration } = data?.data ?? {}

    const resolvedStatus = status ?? EncodingStatus.PENDING

    return {
        status: resolvedStatus,
        progress: progress ?? 0,
        hlsUrl: master_playlist_url ?? null,
        isTerminal: isTerminalStatus(resolvedStatus),
        mediaType: resolvedStatus === EncodingStatus.READY ? MediaType.HLS_VIDEO : MediaType.VIDEO,
        width: width ?? null,
        height: height ?? null,
        duration: duration ?? null,
        restartPolling
    }
}
