"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useVideoRouterNavigation } from "@/hooks/video/useVideoRouterNavigation";

type NavigationVideoProps = {
    className?: string;
};

export default function NavigationVideo({ className }: NavigationVideoProps) {
    const { handleNext, handlePrevious, canGoNext, canGoPrevious } = useVideoRouterNavigation();

    return (
        <div className={cn(className, "flex flex-col")}>
            <Button
                variant="secondary"
                size="icon"
                disabled={!canGoPrevious}
                onClick={handlePrevious}
                className={cn(
                    "rounded-t-full cursor-pointer bg-black/15 py-5 pb-7 text-white [&>svg]:size-6",
                    "hover:bg-black/10",
                    "disabled:bg-black/10 disabled:text-white/50 disabled:cursor-not-allowed disabled:hover:bg-black/10 [&>svg]:size-6!"
                )}
            >
                <ChevronUp />
            </Button>
            <Button
                variant="secondary"
                size="icon"
                disabled={!canGoNext}
                onClick={handleNext}
                className={cn(
                    "rounded-b-full cursor-pointer bg-black/15 py-5 pt-7 text-white [&>svg]:size-6",
                    "hover:bg-accent/15 ",
                    "disabled:bg-black/10 disabled:text-white/50 disabled:cursor-not-allowed disabled:hover:bg-black/10 [&>svg]:size-6!"
                )}
            >
                <ChevronDown />
            </Button>
        </div>
    );
}
