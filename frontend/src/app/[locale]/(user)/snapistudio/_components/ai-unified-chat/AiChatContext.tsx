'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

interface AiChatContextValue {
    uploadContent: string
    setUploadContent: (v: string) => void
    applyToUpload: ((text: string) => void) | null
    setApplyToUpload: (fn: ((text: string) => void) | null) => void
}

const AiChatContext = createContext<AiChatContextValue>({
    uploadContent: '',
    setUploadContent: () => {},
    applyToUpload: null,
    setApplyToUpload: () => {}
})

export function AiChatProvider({ children }: { children: ReactNode }) {
    const [uploadContent, setUploadContent] = useState('')
    const [applyToUpload, setApplyToUploadState] = useState<((text: string) => void) | null>(null)

    const setApplyToUpload = useCallback((fn: ((text: string) => void) | null) => {
        setApplyToUploadState(() => fn)
    }, [])

    return (
        <AiChatContext.Provider value={{ uploadContent, setUploadContent, applyToUpload, setApplyToUpload }}>
            {children}
        </AiChatContext.Provider>
    )
}

export function useAiChatContext() {
    return useContext(AiChatContext)
}
