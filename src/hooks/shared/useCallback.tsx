"use client";

import { useCallback, useRef } from "react";

export default function useDebounceCallback<T extends (...args: unknown[]) => void>(callBack: T, delay: number) {
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    return useCallback(
        (...args: Parameters<T>) => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            timerRef.current = setTimeout(() => {
                callBack(...args);
            }, delay);
        },
        [delay, callBack]
    );
}
