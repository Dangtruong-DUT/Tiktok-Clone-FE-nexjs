import React, { useState, useEffect, useRef, memo } from "react";
import { cn } from "@/lib/utils";

interface VideoDescriptionProps {
    description: string;
    className?: string;
}

function VideoDescription({ description, className }: VideoDescriptionProps) {
    const [expanded, setExpanded] = useState(false);
    const [canExpand, setCanExpand] = useState(false);
    const textRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const checkOverflow = () => {
            const el = textRef.current;
            if (el) setCanExpand(el.scrollHeight > el.clientHeight);
        };
        checkOverflow();
        window.addEventListener("resize", checkOverflow);
        return () => window.removeEventListener("resize", checkOverflow);
    }, [description]);

    return (
        <div className="relative w-4/5">
            <div
                ref={textRef}
                className={cn(
                    "text-sm leading-[18px] font-normal text-white whitespace-pre-wrap overflow-hidden",
                    "[-webkit-box-orient:vertical] [display:-webkit-box]",
                    expanded ? "[-webkit-line-clamp:unset]" : "[-webkit-line-clamp:1]",
                    className
                )}
            >
                {description}
            </div>

            {canExpand && (
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="absolute bottom-0 right-0 transform translate-x-[-12px] translate-y-[-50%] text-sm font-semibold px-1.5 py-0.5 text-white"
                >
                    {expanded ? "Less" : "More"}
                </button>
            )}
        </div>
    );
}

export default memo(VideoDescription);
