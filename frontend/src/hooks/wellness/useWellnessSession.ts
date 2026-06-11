'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setSession, clearSession } from '@/store/features/wellnessSlice'
import { useStartSessionMutation, useEndSessionMutation } from '@/store/services/wellness/screen-time.service'
import { BACKEND_API_ENDPOINT } from '@/constants/api/endpoints'
import envConfig from '@/config/app.config'

export function useWellnessSession(isAuthenticated: boolean): {
    sessionUuid: string | null
    sessionStartedAt: number | null
} {
    const dispatch = useAppDispatch()
    const sessionUuid = useAppSelector((s) => s.wellness.sessionUuid)
    const sessionStartedAt = useAppSelector((s) => s.wellness.sessionStartedAt)

    const [startSession] = useStartSessionMutation()
    const [endSession] = useEndSessionMutation()

    const sessionUuidRef = useRef<string | null>(null)
    const sessionStartedAtRef = useRef<number | null>(null)
    const sessionStartingRef = useRef(false)

    // Mutation stability refs — prevents spurious session-end on RTK Query reference churn
    const startSessionRef = useRef(startSession)
    const endSessionRef = useRef(endSession)
    useEffect(() => {
        startSessionRef.current = startSession
    }, [startSession])
    useEffect(() => {
        endSessionRef.current = endSession
    }, [endSession])

    // Sync Redux state into refs so cleanup closures see current values
    useEffect(() => {
        sessionUuidRef.current = sessionUuid
    }, [sessionUuid])
    useEffect(() => {
        sessionStartedAtRef.current = sessionStartedAt
    }, [sessionStartedAt])

    const handleEndSession = useCallback(
        async (uuid: string, startedAt: number) => {
            const duration = Math.round((Date.now() - startedAt) / 1000)
            try {
                await endSessionRef.current({ uuid, duration_seconds: duration })
            } catch {
                /* fire-and-forget */
            }
            dispatch(clearSession())
        },
        [dispatch]
    )

    useEffect(() => {
        if (!isAuthenticated) return

        let mounted = true

        const init = async () => {
            if (sessionStartingRef.current) return
            sessionStartingRef.current = true
            try {
                const res = await startSessionRef.current().unwrap()
                if (!mounted) return
                dispatch(setSession({ uuid: res.data.uuid, startedAt: Date.now() }))
            } catch {
                /* session start failed, no-op */
            } finally {
                sessionStartingRef.current = false
            }
        }

        init()

        const beforeUnload = () => {
            const uuid = sessionUuidRef.current
            const startedAt = sessionStartedAtRef.current
            if (!uuid) return
            const duration = startedAt ? Math.round((Date.now() - startedAt) / 1000) : 0
            const endUrl = `${envConfig.NEXT_PUBLIC_API_ENDPOINT}${BACKEND_API_ENDPOINT.WELLNESS.SESSION_END(uuid)}`
            fetch(endUrl, {
                method: 'POST',
                credentials: 'include',
                keepalive: true,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ duration_seconds: duration })
            }).catch(() => {})
        }

        window.addEventListener('beforeunload', beforeUnload)

        return () => {
            mounted = false
            window.removeEventListener('beforeunload', beforeUnload)
            const uuid = sessionUuidRef.current
            const startedAt = sessionStartedAtRef.current
            if (uuid && startedAt) {
                handleEndSession(uuid, startedAt)
            }
        }
    }, [isAuthenticated, dispatch, handleEndSession])

    return { sessionUuid, sessionStartedAt }
}
