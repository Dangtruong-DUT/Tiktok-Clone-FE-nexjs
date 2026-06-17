'use client'

import { useEffect, useRef } from 'react'
import { useSendHeartbeatMutation } from '@/store/services/wellness/screen-time.service'
import { useAppSelector } from '@/store/hooks'

const HEARTBEAT_INTERVAL_MS = 60_000

export function useSessionHeartbeat(sessionUuid: string | null): void {
    const [sendHeartbeat] = useSendHeartbeatMutation()
    const pageType = useAppSelector((s) => s.wellness.pageType)

    const sendHeartbeatRef = useRef(sendHeartbeat)
    const pageTypeRef = useRef(pageType)

    useEffect(() => {
        sendHeartbeatRef.current = sendHeartbeat
    }, [sendHeartbeat])

    useEffect(() => {
        pageTypeRef.current = pageType
    }, [pageType])

    useEffect(() => {
        if (!sessionUuid) return

        const interval = setInterval(() => {
            const pt = pageTypeRef.current === 'video' ? 'video' : 'other'
            sendHeartbeatRef.current({ uuid: sessionUuid, page_type: pt }).catch(() => {})
        }, HEARTBEAT_INTERVAL_MS)

        return () => clearInterval(interval)
    }, [sessionUuid])
}
