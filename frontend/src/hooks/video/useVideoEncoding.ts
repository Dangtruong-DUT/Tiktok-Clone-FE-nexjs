'use client'

import { useEffect, useState } from 'react'
import { EncodingStatus, MediaType } from '@/constants/enum'
import { useGetVideoEncodingStatusQuery } from '@/store/services/upload.service'

const POLL_INTERVAL_MS = 3000

export interface VideoEncodingState {
    status: EncodingStatus
    progress: number
    hlsUrl: string | null
    isTerminal: boolean
    mediaType: MediaType
}

const INITIAL_STATE: VideoEncodingState = {
    status: EncodingStatus.PENDING,
    progress: 0,
    hlsUrl: null,
    isTerminal: false,
    mediaType: MediaType.VIDEO,
}

function isTerminalStatus(status: EncodingStatus): boolean {
    return status === EncodingStatus.READY || status === EncodingStatus.FAILED
}

/**
 * Polls /videos/{uuid}/encoding-status every 3 s.
 * Polling stops automatically once status reaches READY or FAILED.
 * Reset uuid to null to clear state (e.g. on file replace).
 */
export function useVideoEncoding(fileUuid: string | null | undefined): VideoEncodingState {
    const [shouldPoll, setShouldPoll] = useState(true)

    // Reset poll gate whenever the target file changes
    useEffect(() => {
        setShouldPoll(true)
    }, [fileUuid])

    const { data } = useGetVideoEncodingStatusQuery(fileUuid ?? '', {
        skip: !fileUuid || !shouldPoll,
        pollingInterval: POLL_INTERVAL_MS,
    })

    // Stop polling as soon as backend reports a terminal status
    useEffect(() => {
        if (!data) return
        if (isTerminalStatus(data.data.status)) {
            setShouldPoll(false)
        }
    }, [data])

    if (!fileUuid || !data) return INITIAL_STATE

    const { status, progress, master_playlist_url } = data.data

    return {
        status,
        progress,
        hlsUrl: master_playlist_url,
        isTerminal: isTerminalStatus(status),
        mediaType: status === EncodingStatus.READY ? MediaType.HLS_VIDEO : MediaType.VIDEO,
    }
}
