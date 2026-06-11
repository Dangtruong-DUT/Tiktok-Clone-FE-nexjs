'use client'

import { useEffect, useRef } from 'react'
import { useSendHeartbeatMutation } from '@/store/services/wellness/screen-time.service'

const HEARTBEAT_INTERVAL_MS = 60_000

export function useSessionHeartbeat(sessionUuid: string | null): void {
    const [sendHeartbeat] = useSendHeartbeatMutation()
    const sendHeartbeatRef = useRef(sendHeartbeat)
    useEffect(() => {
        sendHeartbeatRef.current = sendHeartbeat
    }, [sendHeartbeat])

    useEffect(() => {
        if (!sessionUuid) return

        const interval = setInterval(() => {
            sendHeartbeatRef.current(sessionUuid).catch(() => {})
        }, HEARTBEAT_INTERVAL_MS)

        return () => clearInterval(interval)
    }, [sessionUuid])
}
