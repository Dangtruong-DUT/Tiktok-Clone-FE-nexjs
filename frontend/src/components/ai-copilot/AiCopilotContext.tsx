'use client'

import { createContext, useCallback, useContext, useRef, useState, type ReactNode, type RefObject } from 'react'

import type { AiCopilotSessionContext, AiCopilotTimelineSelection } from '@/types/models/ai-copilot.model'

type FormPatchFn = (value: string) => void
type ClipAndSendFn = (start: number, end: number, question: string) => Promise<void>

interface AiCopilotContextValue {
    // Video / post context pushed by the upload or edit form
    videoContext: Partial<AiCopilotSessionContext>
    setVideoContext: (ctx: Partial<AiCopilotSessionContext>) => void

    // Form field patch registry
    registerFormPatch: (field: string, fn: FormPatchFn) => void
    unregisterFormPatch: (field: string) => void
    applyToForm: (field: string, value: string) => boolean
    hasFormPatch: (field: string) => boolean
    hasAnyFormField: boolean

    // Timeline segment selection
    timelineSelection: AiCopilotTimelineSelection | null
    setTimelineSelection: (sel: AiCopilotTimelineSelection | null) => void

    // Video clip (base64 webm) to be sent with the next message
    pendingVideoClip: string | null
    setPendingVideoClip: (clip: string | null) => void

    // Auto-send a message when the timeline "Analyze With AI" button is clicked
    pendingMessage: string | null
    setPendingMessage: (msg: string | null) => void

    // Timeline clip-and-send: registered by AiVideoAttachments, consumed by CopilotInput chips
    clipAndSend: ClipAndSendFn | null
    setClipAndSend: (fn: ClipAndSendFn | null) => void

    // Shared video ref from AiVideoAttachments — used by useAiCopilot for auto-clip on analysis queries
    videoRef: RefObject<HTMLVideoElement | null> | null
    setVideoRef: (ref: RefObject<HTMLVideoElement | null> | null) => void

    // Panel state
    isPanelOpen: boolean
    openPanel: () => void
    closePanel: () => void
    togglePanel: () => void
}

const AiCopilotContext = createContext<AiCopilotContextValue | null>(null)

export function AiCopilotProvider({ children }: { children: ReactNode }) {
    const [videoContext, setVideoContextState] = useState<Partial<AiCopilotSessionContext>>({})
    const [timelineSelection, setTimelineSelection] = useState<AiCopilotTimelineSelection | null>(null)
    const [pendingVideoClip, setPendingVideoClip] = useState<string | null>(null)
    const [pendingMessage, setPendingMessage] = useState<string | null>(null)
    const [isPanelOpen, setIsPanelOpen] = useState(false)
    const [clipAndSend, setClipAndSendState] = useState<ClipAndSendFn | null>(null)
    const [videoRef, setVideoRefState] = useState<RefObject<HTMLVideoElement | null> | null>(null)

    const setClipAndSend = useCallback((fn: ClipAndSendFn | null) => {
        // useState setter form to avoid stale closure issues with function values
        setClipAndSendState(() => fn)
    }, [])

    const setVideoRef = useCallback((ref: RefObject<HTMLVideoElement | null> | null) => {
        setVideoRefState(ref)
    }, [])

    const patchRegistry = useRef<Record<string, FormPatchFn>>({})
    const [registeredFields, setRegisteredFields] = useState<Set<string>>(new Set())

    const setVideoContext = useCallback((ctx: Partial<AiCopilotSessionContext>) => {
        setVideoContextState((prev) => ({ ...prev, ...ctx }))
    }, [])

    const registerFormPatch = useCallback((field: string, fn: FormPatchFn) => {
        patchRegistry.current[field] = fn
        setRegisteredFields((prev) => new Set([...prev, field]))
    }, [])

    const unregisterFormPatch = useCallback((field: string) => {
        delete patchRegistry.current[field]
        setRegisteredFields((prev) => {
            const next = new Set(prev)
            next.delete(field)
            return next
        })
    }, [])

    const applyToForm = useCallback((field: string, value: string): boolean => {
        const fn = patchRegistry.current[field]
        if (fn) {
            fn(value)
            return true
        }
        return false
    }, [])

    const hasFormPatch = useCallback(
        (field: string): boolean => {
            return registeredFields.has(field)
        },
        [registeredFields]
    )

    const hasAnyFormField = registeredFields.size > 0

    const openPanel = useCallback(() => setIsPanelOpen(true), [])
    const closePanel = useCallback(() => setIsPanelOpen(false), [])
    const togglePanel = useCallback(() => setIsPanelOpen((v) => !v), [])

    return (
        <AiCopilotContext.Provider
            value={{
                videoContext,
                setVideoContext,
                registerFormPatch,
                unregisterFormPatch,
                applyToForm,
                hasFormPatch,
                hasAnyFormField,
                timelineSelection,
                setTimelineSelection,
                pendingVideoClip,
                setPendingVideoClip,
                pendingMessage,
                setPendingMessage,
                clipAndSend,
                setClipAndSend,
                videoRef,
                setVideoRef,
                isPanelOpen,
                openPanel,
                closePanel,
                togglePanel
            }}
        >
            {children}
        </AiCopilotContext.Provider>
    )
}

export function useAiCopilotContext(): AiCopilotContextValue {
    const ctx = useContext(AiCopilotContext)
    if (!ctx) {
        throw new Error('useAiCopilotContext must be used inside <AiCopilotProvider>')
    }
    return ctx
}
