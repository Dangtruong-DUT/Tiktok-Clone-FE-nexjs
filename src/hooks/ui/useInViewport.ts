"use client";

import { useEffect, useState } from "react";

export function useInViewport(ref: React.RefObject<HTMLElement | null>, threshold = 0.5) {
    const [isInView, setIsInView] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => setIsInView(entry.isIntersecting), { threshold });
        const current = ref.current;
        if (current) observer.observe(current);

        return () => {
            if (current) observer.unobserve(current);
        };
    }, [ref, threshold]);

    return isInView;
}
