"use client";

import { useEffect, useRef, useState } from "react";
import type { LottiePlayer, AnimationItem } from "lottie-web";
import { cn } from "@/lib/utils";

export type LottieProps = {
    path: string;
    loop?: boolean;
    autoplay?: boolean;
    className?: string;
};

export default function LazyLottie({ path, loop = false, autoplay = true, className }: LottieProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [lottie, setLottie] = useState<LottiePlayer | null>(null);
    const animationRef = useRef<AnimationItem | null>(null);

    useEffect(() => {
        import("lottie-web").then((Lottie) => setLottie(Lottie.default));
    }, []);

    useEffect(() => {
        if (lottie && containerRef.current) {
            if (animationRef.current) {
                animationRef.current.destroy();
            }

            animationRef.current = lottie.loadAnimation({
                container: containerRef.current,
                renderer: "svg",
                loop,
                autoplay,
                path,
            });

            return () => {
                animationRef.current?.destroy();
            };
        }
    }, [lottie, path, loop, autoplay]);

    return <div ref={containerRef} className={cn("relative", " [&>svg]:max-w-none [&svg]:size-full! ", className)} />;
}
