import { useCallback, useEffect, useState } from "react";

type UseScrollIndexObserverProps = {
    keyDataScroll: string;
    listLength: number;
    initialIndex?: number;
};

export type ScrollType = "UP" | "DOWN";

export default function useScrollIndexObserver({
    keyDataScroll,
    listLength,
    initialIndex = 0,
}: UseScrollIndexObserverProps) {
    const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);
    const handleScrollToIndex = useCallback(
        (direction: ScrollType) => {
            const delta = direction === "UP" ? -1 : 1;
            const newIndex = currentIndex + delta;

            if (newIndex < 0 || newIndex >= listLength) return;

            const target = document.querySelector<HTMLElement>(`[${keyDataScroll}="${newIndex}"]`);
            if (target) {
                target.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        },
        [currentIndex, keyDataScroll, listLength]
    );

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

                if (visible) {
                    const indexAttr = visible.target.getAttribute(keyDataScroll);
                    if (indexAttr !== null) {
                        const index = Number(indexAttr);
                        if (!Number.isNaN(index)) {
                            setCurrentIndex((prev) => (prev !== index ? index : prev));
                        }
                    }
                }
            },
            { threshold: 0.9 }
        );

        const elements = document.querySelectorAll<HTMLElement>(`[${keyDataScroll}]`);
        elements.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, [keyDataScroll, listLength]);

    return {
        currentIndex,
        handleScrollToIndex,
    };
}
