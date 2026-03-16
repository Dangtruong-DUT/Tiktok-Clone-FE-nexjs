"use client";

import { useVideosProvider } from "@/app/[locale]/(public)/(home)/(foryou)/_context/videos-provider";
import { Button } from "@/components/ui/button";
import { ScrollType } from "@/hooks/ui/useScrollIndexObserver";
import { cn } from "@/lib/utils";
import { memo, useCallback, useEffect } from "react";
import { HiOutlineChevronDown, HiOutlineChevronUp } from "react-icons/hi2";

function NavigatorVideo({ className }: { className?: string }) {
    const { handleScrollToIndex, currentIndex, postLength, fetchNextPage, hasNextPage } = useVideosProvider();
    const isFirstPost = currentIndex <= 0;
    const isLastPost = currentIndex >= postLength - 1;

    const handleScroll = useCallback(
        (event: ScrollType) => {
            if (event === "UP" && !isFirstPost) {
                handleScrollToIndex("UP");
            } else if (event === "DOWN") {
                if (!isLastPost) {
                    handleScrollToIndex("DOWN");
                }
                if (hasNextPage && isFirstPost) {
                    fetchNextPage();
                }
            }
        },
        [handleScrollToIndex, isFirstPost, isLastPost, hasNextPage, fetchNextPage]
    );

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "ArrowUp") {
                handleScroll("UP");
            } else if (event.key === "ArrowDown") {
                handleScroll("DOWN");
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [handleScrollToIndex, handleScroll, currentIndex, postLength]);

    return (
        <div className={cn("flex flex-col items-center justify-center h-full w-14 gap-4 ", className)}>
            <Button
                variant="secondary"
                className={cn(
                    " aspect-square size-[1em]  text-[clamp(2rem,3vw+1rem,3rem)] rounded-full cursor-pointer",
                    {
                        "opacity-50 cursor-not-allowed user-select-none ": isFirstPost,
                    }
                )}
                onClick={() => handleScroll("UP")}
                aria-label="Previous video"
            >
                <HiOutlineChevronUp className="size-[0.5em] cursor-inherit" />
            </Button>

            <Button
                variant="secondary"
                className={cn("aspect-square size-[1em] text-[clamp(2rem,3vw+1rem,3rem)] rounded-full cursor-pointer", {
                    "opacity-50 cursor-not-allowed user-select-none": isLastPost && !hasNextPage,
                })}
                onClick={() => handleScroll("DOWN")}
                aria-label="Next video"
            >
                <HiOutlineChevronDown className="size-[0.5em] cursor-inherit" />
            </Button>
        </div>
    );
}

export default memo(NavigatorVideo);
