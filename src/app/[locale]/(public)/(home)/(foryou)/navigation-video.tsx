"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { memo, useEffect } from "react";
import { HiOutlineChevronDown, HiOutlineChevronUp } from "react-icons/hi2";

interface NavigatorVideoProps {
    handleClickPrevBtn: () => void;
    handleClickNextBtn: () => void;
    isDisabledUp: boolean;
    isDisabledDown: boolean;
}

function NavigatorVideo({ handleClickPrevBtn, handleClickNextBtn, isDisabledUp, isDisabledDown }: NavigatorVideoProps) {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "ArrowUp" && !isDisabledUp) {
                handleClickPrevBtn();
            } else if (event.key === "ArrowDown" && !isDisabledDown) {
                handleClickNextBtn();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [handleClickPrevBtn, handleClickNextBtn, isDisabledUp, isDisabledDown]);

    return (
        <div className="flex flex-col items-center justify-center h-full w-12 gap-4 ">
            <Button
                variant="secondary"
                className={cn(
                    " aspect-square size-[1em]  text-[clamp(2rem,3vw+1rem,3rem)] rounded-full cursor-pointer",
                    {
                        "opacity-50 cursor-not-allowed user-select-none ": isDisabledUp,
                    }
                )}
                onClick={handleClickPrevBtn}
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
                onClick={handleClickNextBtn}
                disabled={isDisabledDown}
                aria-label="Next video"
            >
                <HiOutlineChevronDown className="size-[0.5em] cursor-inherit" />
            </Button>
        </div>
    );
}

export default memo(NavigatorVideo);
