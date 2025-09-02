"use client";

import { Dialog, DialogContent, DialogHeader, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { toast } from "sonner";

interface ShareMenuDialogProps {
    url: string;
    children: React.ReactNode;
}

export function ShareMenuDialog({ url, children }: ShareMenuDialogProps) {
    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(url);
            toast.success("Link copied to clipboard!");
        } catch (_) {
            toast.error("Failed to copy link");
        }
    };

    const shareItems = [
        {
            name: "Copy",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 48 48" fill="#2196F3">
                    <circle cx="24" cy="24" r="24" fill="currentColor" opacity="0.2" />
                    <path
                        d="M32 18H25V16H32C33.1 16 34 16.9 34 18V25H32V18ZM16 32V25H18V32H25V34H18C16.9 34 16 33.1 16 32ZM18 16V18H16V16C16 14.9 16.9 14 18 14H25V16H18ZM32 34H25V32H32V25H34V32C34 33.1 33.1 34 32 34Z"
                        fill="currentColor"
                    />
                </svg>
            ),
            onClick: handleCopyLink,
        },
        {
            name: "WhatsApp",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 48 48" fill="#25D366">
                    <circle cx="24" cy="24" r="24" fill="currentColor" opacity="0.2" />
                    <path
                        d="M24 12C17.373 12 12 17.373 12 24C12 26.504 12.766 28.837 14.069 30.812L12 36L17.188 33.931C19.163 35.234 21.496 36 24 36C30.627 36 36 30.627 36 24C36 17.373 30.627 12 24 12ZM29.203 27.938C28.968 28.661 27.904 29.288 27.165 29.448C26.684 29.55 26.055 29.633 23.896 28.677C21.069 27.441 19.275 24.557 19.104 24.328C18.94 24.099 17.815 22.625 17.815 21.101C17.815 19.577 18.603 18.831 18.888 18.522C19.172 18.214 19.506 18.135 19.704 18.135C19.902 18.135 20.1 18.135 20.273 18.142C20.454 18.15 20.704 18.068 20.951 18.704C21.204 19.359 21.859 20.883 21.941 21.061C22.024 21.239 22.083 21.444 21.967 21.673C21.851 21.902 21.797 22.037 21.619 22.244C21.441 22.451 21.248 22.708 21.088 22.868C20.91 23.046 20.724 23.241 20.931 23.587C21.138 23.933 21.79 24.998 22.742 25.853C23.975 26.965 25.009 27.301 25.355 27.479C25.701 27.657 25.906 27.628 26.113 27.393C26.32 27.158 26.943 26.422 27.179 26.076C27.415 25.73 27.651 25.788 27.972 25.906C28.294 26.024 29.811 26.77 30.162 26.947C30.513 27.125 30.733 27.214 30.815 27.364C30.897 27.514 30.897 28.167 30.662 28.89L29.203 27.938Z"
                        fill="currentColor"
                    />
                </svg>
            ),
            onClick: () => {
                window.open(`https://wa.me/?text=${encodeURIComponent(url)}`, "_blank");
            },
        },
        {
            name: "Facebook",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 48 48" fill="#1877F2">
                    <circle cx="24" cy="24" r="24" fill="currentColor" opacity="0.2" />
                    <path
                        d="M27.7 16.9H29.8V13.3C29.4 13.2 28.1 13 26.6 13C23.4 13 21.2 15 21.2 18.5V21.7H17.8V25.7H21.2V36H25.2V25.7H28.5L29 21.7H25.2V19C25.2 17.7 25.6 16.9 27.7 16.9Z"
                        fill="currentColor"
                    />
                </svg>
            ),
            onClick: () => {
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
            },
        },
        {
            name: "X (Twitter)",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 48 48" fill="#000000">
                    <circle cx="24" cy="24" r="24" fill="currentColor" opacity="0.2" />
                    <path
                        d="M36 16.4C35.1 16.8 34.2 17 33.2 17.1C34.2 16.5 35 15.5 35.4 14.4C34.5 15 33.4 15.4 32.3 15.6C31.4 14.6 30.1 14 28.6 14C25.9 14 23.7 16.2 23.7 18.9C23.7 19.3 23.7 19.7 23.8 20C19.7 19.8 16.1 17.8 13.7 14.9C13.3 15.6 13.1 16.5 13.1 17.4C13.1 19.1 14 20.6 15.2 21.5C14.4 21.5 13.6 21.3 13 20.9V21C13 23.4 14.7 25.4 16.9 25.8C16.5 25.9 16.1 26 15.7 26C15.4 26 15.1 26 14.8 25.9C15.4 27.9 17.2 29.2 19.3 29.3C17.6 30.5 15.5 31.2 13.2 31.2C12.8 31.2 12.4 31.2 12 31.1C14.2 32.4 16.8 33.1 19.5 33.1C28.6 33.1 33.5 25.7 33.5 19.4C33.5 19.2 33.5 19 33.5 18.8C34.5 18.1 35.3 17.3 36 16.4Z"
                        fill="currentColor"
                    />
                </svg>
            ),
            onClick: () => {
                window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`, "_blank");
            },
        },
        {
            name: "Telegram",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 48 48" fill="#0088cc">
                    <circle cx="24" cy="24" r="24" fill="currentColor" opacity="0.2" />
                    <path
                        d="M34.3 14.3L11.9 22.9C10.5 23.4 10.5 24.1 11.7 24.4L17.3 26.2L30.8 17.8C31.4 17.4 31.9 17.6 31.5 18L20.6 27.8H20.5L20.6 27.8L20.1 33.5C20.6 33.5 20.8 33.3 21.1 33L23.8 30.4L29.4 34.5C30.4 35 31.1 34.7 31.3 33.5L35.1 15.7C35.4 14.3 34.5 13.7 34.3 14.3Z"
                        fill="currentColor"
                    />
                </svg>
            ),
            onClick: () => {
                window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}`, "_blank");
            },
        },
    ];

    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader className="hidden" />
                <Carousel
                    opts={{
                        align: "start",
                    }}
                    className="w-full max-w-sm"
                >
                    <CarouselContent>
                        {shareItems.map((item, index) => (
                            <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                                <div className="p-1">
                                    <Card>
                                        <CardContent
                                            className="flex flex-col aspect-square items-center justify-center p-6 gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                            onClick={item.onClick}
                                        >
                                            {item.icon}
                                            <span className="text-sm font-medium">{item.name}</span>
                                        </CardContent>
                                    </Card>
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
