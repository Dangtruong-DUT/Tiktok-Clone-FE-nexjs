"use client";

import { useCallback, useState } from "react";

interface UseVideoNavigatorProps {
    initialIndex?: number;
    maxIndex?: number;
    onNavigate?: (index: number, direction: "prev" | "next") => void;
}

export function useVideoNavigator({ initialIndex = 0, maxIndex, onNavigate }: UseVideoNavigatorProps = {}) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    const handlePrevious = useCallback(() => {
        if (currentIndex > 0) {
            const newIndex = currentIndex - 1;
            setCurrentIndex(newIndex);
            onNavigate?.(newIndex, "prev");
        }
    }, [currentIndex, onNavigate]);

    const handleNext = useCallback(() => {
        if (maxIndex === undefined || currentIndex < maxIndex) {
            const newIndex = currentIndex + 1;
            setCurrentIndex(newIndex);
            onNavigate?.(newIndex, "next");
        }
    }, [currentIndex, maxIndex, onNavigate]);

    const goToIndex = useCallback(
        (index: number) => {
            if (index >= 0 && (maxIndex === undefined || index <= maxIndex)) {
                setCurrentIndex(index);
            }
        },
        [maxIndex]
    );

    return {
        currentIndex,
        handlePrevious,
        handleNext,
        goToIndex,
        canGoPrevious: currentIndex > 0,
        canGoNext: maxIndex === undefined || currentIndex < maxIndex,
    };
}
