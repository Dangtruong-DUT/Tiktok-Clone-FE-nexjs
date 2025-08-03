"use client";

import { useEffect, useRef } from "react";
import lottie, { AnimationItem } from "lottie-web";
import { useQuery } from "@tanstack/react-query";

interface LottieProps<T extends Record<string, unknown>> {
    getAnimationData: () => Promise<T>;
    id: string;
    loop?: boolean;
    autoplay?: boolean;
    className?: string;
}

export default function LazyLottie<T extends Record<string, unknown>>({
    getAnimationData,
    id,
    loop = true,
    autoplay = true,
    className,
}: LottieProps<T>) {
    const containerRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<AnimationItem | null>(null);

    const { data } = useQuery({
        queryKey: [id],
        queryFn: getAnimationData,
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        enabled: typeof window !== "undefined",
    });

    useEffect(() => {
        if (data && containerRef.current) {
            if (animationRef.current) {
                animationRef.current.destroy();
            }

            animationRef.current = lottie.loadAnimation({
                container: containerRef.current,
                renderer: "svg",
                loop,
                autoplay,
                animationData: data,
            });
        }

        return () => {
            animationRef.current?.destroy();
        };
    }, [data, loop, autoplay]);
    return <div ref={containerRef} className={className} />;
}
