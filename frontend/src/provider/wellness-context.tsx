'use client'

import { createContext, useContext } from 'react'

interface WellnessContextValue {
    reportVideoTime: (seconds: number) => void
    trackAction: (action: 'comment' | 'like' | 'post') => void
}

const noop = () => {}

export const WellnessContext = createContext<WellnessContextValue>({
    reportVideoTime: noop,
    trackAction: noop
})

export function useWellness(): WellnessContextValue {
    return useContext(WellnessContext)
}
