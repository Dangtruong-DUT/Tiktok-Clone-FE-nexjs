'use client'

import {
    createContext,
    useCallback,
    useContext,
    useRef,
    useState,
    type ReactNode,
} from 'react'
import type { AiCopilotSessionContext, AiCopilotTimelineSelection } from '@/types/models/ai-copilot.model'

type FormPatchFn = (value: string) => void

interface AiCopilotContextValue {
    // Video / post context pushed by the upload or edit form
    videoContext: Partial<AiCopilotSessionContext>
    setVideoContext: (ctx: Partial<AiCopilotSessionContext>) => void

    // Form field patch registry
    registerFormPatch: (field: string, fn: FormPatchFn) => void
    unregisterFormPatch: (field: string) => void
    applyToForm: (field: string, value: string) => boolean

    // Attachment state (shared between FramePicker / TimelineSelector and CopilotInput)
    selectedFrames: string[]                      // base64 PNG strings
    setSelectedFrames: (frames: string[]) => void
    clearFrames: () => void

    timelineSelection: AiCopilotTimelineSelection | null
    setTimelineSelection: (sel: AiCopilotTimelineSelection | null) => void

    // Panel state
    isPanelOpen: boolean
    openPanel: () => void
    closePanel: () => void
    togglePanel: () => void
}

const AiCopilotContext = createContext<AiCopilotContextValue | null>(null)

export function AiCopilotProvider({ children }: { children: ReactNode }) {
    const [videoContext, setVideoContextState] = useState<Partial<AiCopilotSessionContext>>({})
    const [selectedFrames, setSelectedFrames] = useState<string[]>([])
    const [timelineSelection, setTimelineSelection] = useState<AiCopilotTimelineSelection | null>(null)
    const [isPanelOpen, setIsPanelOpen] = useState(false)

    const patchRegistry = useRef<Record<string, FormPatchFn>>({})

    const setVideoContext = useCallback((ctx: Partial<AiCopilotSessionContext>) => {
        setVideoContextState((prev) => ({ ...prev, ...ctx }))
    }, [])

    const registerFormPatch = useCallback((field: string, fn: FormPatchFn) => {
        patchRegistry.current[field] = fn
    }, [])

    const unregisterFormPatch = useCallback((field: string) => {
        delete patchRegistry.current[field]
    }, [])

    const applyToForm = useCallback((field: string, value: string): boolean => {
        const fn = patchRegistry.current[field]
        if (fn) {
            fn(value)
            return true
        }
        return false
    }, [])

    const clearFrames = useCallback(() => setSelectedFrames([]), [])

    const openPanel  = useCallback(() => setIsPanelOpen(true), [])
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
                selectedFrames,
                setSelectedFrames,
                clearFrames,
                timelineSelection,
                setTimelineSelection,
                isPanelOpen,
                openPanel,
                closePanel,
                togglePanel,
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
