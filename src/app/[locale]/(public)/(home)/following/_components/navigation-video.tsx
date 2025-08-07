"use client";

import { useVideosProvider } from "@/app/[locale]/(public)/(home)/(foryou)/_context/videos-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { memo, useEffect } from "react";
import { HiOutlineChevronDown, HiOutlineChevronUp } from "react-icons/hi2";

function NavigatorVideo({ className }: { className?: string }) {
    const { handleScrollToIndex, currentIndex, postLength } = useVideosProvider();
    const isDisabledUp = currentIndex <= 0;
    const isDisabledDown = currentIndex >= postLength - 1;

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "ArrowUp" && !isDisabledUp) {
                handleScrollToIndex("UP");
            } else if (event.key === "ArrowDown" && !isDisabledDown) {
                handleScrollToIndex("DOWN");
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [handleScrollToIndex, currentIndex, postLength, isDisabledUp, isDisabledDown]);

    return (
        <div className={cn("flex flex-col items-center justify-center h-full w-12 gap-4 ", className)}>
            <Button
                variant="secondary"
                className={cn(
                    " aspect-square size-[1em]  text-[clamp(2rem,3vw+1rem,3rem)] rounded-full cursor-pointer",
                    {
                        "opacity-50 cursor-not-allowed user-select-none ": isDisabledUp,
                    }
                )}
                onClick={() => handleScrollToIndex("UP")}
                disabled={isDisabledUp}
                aria-label="Previous video"
            >
                <HiOutlineChevronUp className="size-[0.5em] cursor-inherit" />
            </Button>

            <Button
                variant="secondary"
                className={cn("aspect-square size-[1em] text-[clamp(2rem,3vw+1rem,3rem)] rounded-full cursor-pointer", {
                    "opacity-50 cursor-not-allowed user-select-none": isDisabledDown,
                })}
                onClick={() => handleScrollToIndex("DOWN")}
                disabled={isDisabledDown}
                aria-label="Next video"
            >
                <HiOutlineChevronDown className="size-[0.5em] cursor-inherit" />
            </Button>
        </div>
    );
}

export default memo(NavigatorVideo);
