import React, { memo, useRef, useState, TouchEvent, MouseEvent } from "react";
import { cn } from "@/lib/utils";
import { formatSecondsToTime } from "@/utils/formatting/formatTime";

interface ProgressBarProps {
    currentTime: number;
    duration: number;
    className?: string;
    onActive: (active: boolean) => void;
    onSeek: (time: number) => void;
}

function ProgressBar({ currentTime, duration, className, onActive, onSeek }: ProgressBarProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [dragTime, setDragTime] = useState(currentTime);
    const progressBarRef = useRef<HTMLDivElement>(null);

    const calculateTimeFromEvent = (e: MouseEvent | TouchEvent): number => {
        const slider = progressBarRef.current;
        if (!slider) return currentTime;

        const rect = slider.getBoundingClientRect();
        const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
        const offsetX = Math.min(Math.max(clientX - rect.left, 0), rect.width);

        return (offsetX / rect.width) * duration;
    };

    const handleStart = (e: MouseEvent | TouchEvent) => {
        e.preventDefault();
        setIsDragging(true);
        const newTime = calculateTimeFromEvent(e);
        setDragTime(newTime);
        onSeek(newTime);
        onActive(true);
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
        if (!isDragging) return;
        const newTime = calculateTimeFromEvent(e);
        setDragTime(newTime);
        onSeek(newTime);
    };

    const handleEnd = () => {
        if (!isDragging) return;
        setIsDragging(false);
        onActive(false);
    };

    const handleTrackClick = (e: MouseEvent | TouchEvent) => {
        const newTime = calculateTimeFromEvent(e);
        onSeek(newTime);
    };

    const progressPercentage = isDragging ? (dragTime / duration) * 100 : (currentTime / duration) * 100;
    return (
        <div
            className={cn("absolute bottom-0 h-6 w-full select-none group/progress", className)}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
        >
            {/* Nút kéo */}
            <div
                className={cn(
                    "block absolute opacity-0 top-1/2 -translate-x-1/2 w-3 aspect-square z-[6] bg-white shadow-[0_0_1px_1px_rgba(0,0,0,0.3)] rounded-full",
                    " translate-y-0.5 cursor-grab transition-opacity duration-100 ease-in-out",
                    "before:content-[''] before:absolute before:-top-[9px] before:-left-[9px] before:-right-[9px] before:-bottom-[9px]",
                    "before:bg-transparent before:z-[7]",
                    "group-hover/progress:opacity-100",
                    isDragging && "cursor-grabbing opacity-100"
                )}
                style={{ left: `${progressPercentage}%` }}
                onMouseDown={handleStart}
                onTouchStart={handleStart}
            />

            {/* Hiển thị thời gian */}
            <div
                className={cn(
                    "absolute z-[1] top-0 left-1/2 -translate-x-1/2 -translate-y-[200%] bg-transparent text-white",
                    "  h-[30px] text-shadow-[0_0_1px_rgba(0,0,0,0.3)] text-center text-[32px] font-bold",
                    "tracking-normal whitespace-nowrap origin-bottom-left transition-all duration-200 ease-in-out",
                    isDragging ? "visible opacity-100 scale-100" : "invisible opacity-0 scale-80"
                )}
            >
                {formatSecondsToTime(isDragging ? dragTime : currentTime)} / {formatSecondsToTime(duration)}
            </div>

            {/* Thanh tiến độ */}
            <div className="relative flex items-end h-full rounded-bl-2xl rounded-br-2xl overflow-hidden">
                <div
                    ref={progressBarRef}
                    className={cn(
                        "flex-shrink-0 block relative w-full left-0 bg-white/20 cursor-pointer select-none",
                        "transition-all duration-200 group-hover/progress:h-1.5 ease-in-out",
                        isDragging ? "h-1.3" : "h-1"
                    )}
                    onMouseDown={handleTrackClick}
                    onTouchStart={handleTrackClick}
                >
                    <div
                        className="block absolute h-full bg-brand rounded-[5px]"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
            </div>
        </div>
    );
}

export default memo(ProgressBar);
