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

            if (newIndex < 0 || newIndex >= listLength || newIndex === currentIndex) return;

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
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        const indexAttr = entry.target.getAttribute(keyDataScroll);
                        if (indexAttr === null) continue;

                        const index = Number(indexAttr);
                        if (!Number.isNaN(index) && index !== currentIndex) {
                            setCurrentIndex(index);
                        }
                    }
                }
            },
            {
                threshold: 0.9,
            }
        );

        const elements = document.querySelectorAll<HTMLElement>("[data-scroll-index]");
        elements.forEach((el) => observer.observe(el));

        return () => {
            observer.disconnect();
        };
    }, [currentIndex, keyDataScroll]);

    return {
        currentIndex,
        handleScrollToIndex,
    };
}
