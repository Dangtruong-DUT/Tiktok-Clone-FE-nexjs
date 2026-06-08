import { useState, useCallback } from 'react'

export function useAnimatedState(duration = 3000) {
    const [isAnimating, setIsAnimating] = useState(false)

    const trigger = useCallback(() => {
        setIsAnimating(true)
        setTimeout(() => setIsAnimating(false), duration)
    }, [duration])

    return { isAnimating, trigger }
}
