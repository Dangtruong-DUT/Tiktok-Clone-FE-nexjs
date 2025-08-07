"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ShowMoreProps {
    text: string;
    maxHeight?: number;
    className?: string;
    textClassName?: string;
}

const ShowMore: React.FC<ShowMoreProps> = ({ text, maxHeight = 100, className, textClassName }) => {
    const [expanded, setExpanded] = useState(false);
    const [showButton, setShowButton] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (contentRef.current) {
            setShowButton(contentRef.current.scrollHeight > maxHeight);
        }
    }, [text, maxHeight]);

    return (
        <div className={cn("relative", className)}>
            <div
                ref={contentRef}
                style={{
                    maxHeight: expanded ? "none" : `${maxHeight}px`,
                    overflow: "hidden",
                    transition: "max-height 0.3s ease",
                }}
                className={cn("text-sm", textClassName)}
            >
                {text}
            </div>

            {showButton && (
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="mt-2 text-sm hover:underline cursor-pointer text-muted-foreground "
                >
                    {expanded ? "less" : "more"}
                </button>
            )}
        </div>
    );
};

export default ShowMore;
