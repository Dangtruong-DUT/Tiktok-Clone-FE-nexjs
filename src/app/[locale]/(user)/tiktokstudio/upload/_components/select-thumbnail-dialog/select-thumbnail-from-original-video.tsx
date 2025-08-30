"use client";

import { Button } from "@/components/ui/button";
import { convertBase64ToFileToFile } from "@/utils/file";
import { TimelineFrameType } from "@/utils/video";
import Image from "next/image";
import { useEffect, useRef, useState, TouchEvent, MouseEvent as ReactMouseEvent, MouseEvent } from "react";

interface SelectThumbnailFromOriginalVideoProps {
    setCoverImage: (image: File) => void;
    className?: string;
    videoFrames: TimelineFrameType[];
}

export default function SelectThumbnailFromOriginalVideo({
    setCoverImage,
    className,
    videoFrames,
}: SelectThumbnailFromOriginalVideoProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [cursorX, setCursorX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const selectedFrame = videoFrames[selectedIndex] ?? { time: 0, image: "" };

    useEffect(() => {
        if (!canvasRef.current || videoFrames.length === 0) return;
        const ctx = canvasRef.current.getContext("2d");
        if (!ctx) return;

        const thumbnailWidth = canvasRef.current.width / videoFrames.length;
        const thumbnailHeight = canvasRef.current.height;

        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        videoFrames.forEach((frame, index) => {
            const img = new window.Image();
            img.src = frame.image;
            img.onload = () => {
                ctx.drawImage(img, index * thumbnailWidth, 0, thumbnailWidth, thumbnailHeight);
            };
        });
    }, [videoFrames]);

    const calculateFrameSelected = (e: MouseEvent | TouchEvent) => {
        if (!canvasRef.current || videoFrames.length === 0) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = "touches" in e ? e.touches[0].clientX : e.clientX;
        const offsetX = Math.min(Math.max(x - rect.left, 0), rect.width);

        setCursorX(offsetX);

        const index = Math.floor(offsetX / (rect.width / frames.length));
        if (index >= 0 && index < frames.length) {
            setSelectedIndex(index);
        }
    };

    const handleStart = (e: MouseEvent | TouchEvent) => {
        setIsDragging(true);
        calculateFrameSelected(e);
    };

    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
        if (!isDragging) return;
        calculateFrameSelected(e);
    };

    const handleEnd = () => {
        setIsDragging(false);
    };

    const onConfirm = async (e: ReactMouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!selectedFrame.image) return;
        const file = await convertBase64ToFileToFile(selectedFrame.image, "thumbnail.png");
        if (file) setCoverImage(file);
    };

    return (
        <div className={className}>
            <div className="flex flex-col items-center gap-4 py-4 min-h-[346px]">
                {selectedFrame.image && (
                    <Image
                        width={182}
                        height={324}
                        alt=""
                        src={selectedFrame.image}
                        className="rounded-xs bg-muted border-none"
                    />
                )}
                {!selectedFrame.image && <div className="rounded-xs bg-amber-50 border-none w-[182px] h-[324px]" />}

                <div
                    className="relative cursor-grab"
                    onClick={calculateFrameSelected}
                    onMouseDown={handleStart}
                    onTouchStart={handleStart}
                    onTouchMove={handleMouseMove}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleEnd}
                    onTouchEnd={handleEnd}
                >
                    <div
                        className="absolute block w-1 h-full rounded-full bg-cyan-500 top-0"
                        style={{ left: `${cursorX}px` }}
                    />
                    <canvas width={384} height={64} className="rounded-xs bg-amber-50" ref={canvasRef} />
                </div>
            </div>
            <footer className=" flex items-center justify-end p-4 border-t  bg-background">
                <Button
                    className="primary-button h-10! rounded-lg! cursor-pointer text-sm! font-medium!"
                    onClick={onConfirm}
                >
                    Confirm
                </Button>
            </footer>
        </div>
    );
}
