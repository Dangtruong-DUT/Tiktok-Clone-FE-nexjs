"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/provider/app-provider";
import { X } from "lucide-react";
import { useCallback } from "react";

export default function CommentsWrapper({ children, className }: { children: React.ReactNode; className?: string }) {
    const { isOpenVideoComments, setIsOpenVideoComments } = useAppContext();

    const handleCloseComments = useCallback(() => {
        setIsOpenVideoComments(false);
    }, [setIsOpenVideoComments]);

    return (
        <section
            className={cn(className, {
                "translate-x-0 ml-4": isOpenVideoComments,
                "translate-x-full pointer-events-none": !isOpenVideoComments,
            })}
            style={
                {
                    "--target-width": "24rem",
                } as React.CSSProperties
            }
        >
            <header className="flex justify-between items-center pe-3 ">
                <h4 className="text-base font-semibold">Comments</h4>
                <Button
                    variant="secondary"
                    className="size-7 aspect-square rounded-full shadow-xs cursor-pointer"
                    onClick={handleCloseComments}
                >
                    <X />
                </Button>
            </header>
            {children}
        </section>
    );
}
