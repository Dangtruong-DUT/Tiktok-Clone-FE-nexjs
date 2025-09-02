"use client";

import { Dialog, DialogContent, DialogHeader, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { toast } from "sonner";
import { createShareItems } from "@/components/share-items";
import { useCallback, useMemo } from "react";
import { DialogTitle } from "@radix-ui/react-dialog";

interface ShareMenuDialogProps {
    url: string;
    children: React.ReactNode;
}

export function ShareMenuDialog({ url, children }: ShareMenuDialogProps) {
    const handleCopyLink = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(url);
            toast.success("Link copied to clipboard!", {
                position: "top-center",
            });
        } catch (_) {}
    }, [url]);

    const shareItems = useMemo(() => createShareItems(url, handleCopyLink), [url, handleCopyLink]);

    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent showCloseButton={false} className="w-fit min-w-lg!">
                <DialogHeader className="hidden">
                    <DialogTitle>Share this content</DialogTitle>
                </DialogHeader>
                <Carousel
                    opts={{
                        align: "center",
                    }}
                    className="w-fit max-w-sm mx-auto"
                >
                    <CarouselContent>
                        {shareItems.map((item, index) => (
                            <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                                <div className="p-1">
                                    <CardContent
                                        className="flex flex-col aspect-[3/4] items-center justify-center p-2 gap-2 cursor-pointer  transition-colors text-[64px] h-fit hover:bg-accent/90 rounded-md"
                                        onClick={item.onClick}
                                    >
                                        {item.icon}
                                        <span className="text-xs font-medium">{item.name}</span>
                                    </CardContent>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
            </DialogContent>
        </Dialog>
    );
}
