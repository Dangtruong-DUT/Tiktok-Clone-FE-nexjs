"use client";

import { Button } from "@/components/ui/button";
import useVideoFrames from "@/hooks/video/useVideoFrames";
import Image from "next/image";
import { useEffect, useRef, useState, TouchEvent, MouseEvent } from "react";

interface SelectThumbnailFromOriginalVideoProps {
    videoSrc: string | null;
    setCoverImage: (image: File) => void;
}

export default function SelectThumbnailFromOriginalVideo({
    videoSrc,
    setCoverImage,
}: SelectThumbnailFromOriginalVideoProps) {
    const frames = useVideoFrames(videoSrc, 10);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [cursorX, setCursorX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const selectedFrame = frames[selectedIndex] ?? { time: 0, image: "" };

    useEffect(() => {
        if (!canvasRef.current || frames.length === 0) return;
        const ctx = canvasRef.current.getContext("2d");
        if (!ctx) return;

        const thumbnailWidth = canvasRef.current.width / frames.length;
        const thumbnailHeight = canvasRef.current.height;

        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        frames.forEach((frame, index) => {
            const img = new window.Image();
            img.src = frame.image;
            img.onload = () => {
                ctx.drawImage(img, index * thumbnailWidth, 0, thumbnailWidth, thumbnailHeight);
            };
        });
    }, [frames]);

    const calculateFrameSelected = (e: MouseEvent | TouchEvent) => {
        if (!canvasRef.current || frames.length === 0) return;
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

    const onConfirm = () => {
        if (!selectedFrame.image) return;
        fetch(selectedFrame.image)
            .then((res) => res.blob())
            .then((blob) => {
                const file = new File([blob], "thumbnail.png", { type: "image/png" });
                setCoverImage(file);
            });
    };

    return (
        <div>
            <div className="flex flex-col items-center gap-4 py-4">
                {selectedFrame.image && (
                    <Image
                        width={182}
                        height={324}
                        alt=""
                        src={selectedFrame.image}
                        className="rounded-xs bg-muted border-none"
                    />
                )}
                {!selectedFrame.image && <div className="rounded-xs bg-muted border-none w-[182px] h-[324px]" />}

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
                    <canvas width={384} height={64} className="rounded-xs bg-muted" ref={canvasRef} />
                </div>
            </div>
            <footer className=" flex items-center justify-end p-4 border-t  ">
                <Button className="primary-button h-10! rounded-lg! cursor-pointer" onClick={onConfirm}>
                    Confirm
                </Button>
            </footer>
        </div>
    );
}
