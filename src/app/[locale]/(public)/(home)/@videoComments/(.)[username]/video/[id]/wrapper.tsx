"use client";

import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/provider/app-provider";
import { X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export default function CommentsWrapper({ children, className }: { children: React.ReactNode; className?: string }) {
    const { isOpenVideoComments, setIsOpenVideoComments } = useAppContext();
    const [isVisible, setIsVisible] = useState<boolean>(isOpenVideoComments);
    const pathname = usePathname();
    const router = useRouter();

    console.log("CommentsWrapper isOpenVideoComments:", pathname);
    const isVideoPath = /@[^\/]+\/video\/[^\/]+$/.test(pathname);

    const handleCloseComments = useCallback(() => {
        setIsOpenVideoComments(false);
    }, [setIsOpenVideoComments]);

    useEffect(() => {
        if (isOpenVideoComments === false) {
            setIsVisible(false);
            if (isVideoPath && isVisible) router.back();
        }
        if (!isVideoPath && isVisible) {
            setIsOpenVideoComments(false);
        }
    }, [isOpenVideoComments, isVideoPath, setIsVisible, setIsOpenVideoComments, router, isVisible]);

    if (isVisible == false) return null;
    return (
        <section
            className={cn(
                "flex-1 min-h-screen flex flex-col py-3 pl-3 max-w-96 bg-sidebar border-l transition-transform duration-300",
                className
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
