"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useCallback, useState } from "react";

export default function CommentsWrapper({ children }: { children: React.ReactNode }) {
    const [isVisible, setIsVisible] = useState(true);
    const router = useRouter();

    const handleCloseComments = useCallback(() => {
        setIsVisible(false);
        setTimeout(() => {
            router.back();
        }, 300);
    }, [router]);

    return (
        <section
            className={cn(
                "flex-1 min-h-screen flex flex-col  py-3 pl-3  max-w-96   bg-sidebar transition-transform duration-300  border-l ",
                {
                    "animate-slide-in w-96": isVisible,
                    "animate-slide-out": !isVisible,
                }
            )}
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
                    className="size-7 aspect-square rounded-full shadow-xs"
                    onClick={handleCloseComments}
                >
                    <X />
                </Button>
            </header>
            {children}
        </section>
    );
}
