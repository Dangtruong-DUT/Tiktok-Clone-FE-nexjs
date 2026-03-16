import React, { memo, useRef, useState, TouchEvent, MouseEvent } from "react";
import { cn } from "@/lib/utils";
import { FaVolumeMute } from "react-icons/fa";
import { HiSpeakerWave } from "react-icons/hi2";

interface VolumeBarProps {
    className?: string;
    volume: number;
    onVolumeChange: (volume: number) => void;
    isParentHovered?: boolean;
    isMuted: boolean;
    onMuteToggle: () => void;
}

function VolumeBar({
    className,
    volume,
    onVolumeChange,
    isParentHovered = true,
    isMuted,
    onMuteToggle,
}: VolumeBarProps) {
    const volumeRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragVolume, setDragVolume] = useState(volume);

    const calculateVolumeFromEvent = (event: MouseEvent | TouchEvent): number => {
        if (!volumeRef.current) return volume;

        const rect = volumeRef.current.getBoundingClientRect();
        const clientX = "touches" in event ? event.touches[0].clientX : event.clientX;
        const offsetX = Math.min(Math.max(clientX - rect.left, 0), rect.width);
        return offsetX / rect.width;
    };

    const handleStart = (event: MouseEvent | TouchEvent) => {
        event.preventDefault();
        setIsDragging(true);
        const newVolume = calculateVolumeFromEvent(event);
        setDragVolume(newVolume);
        onVolumeChange(newVolume);
    };

    const handleMove = (event: MouseEvent | TouchEvent) => {
        if (!isDragging) return;
        const newVolume = calculateVolumeFromEvent(event);
        setDragVolume(newVolume);
        onVolumeChange(newVolume);
    };

    const handleEnd = () => {
        if (!isDragging) return;
        setIsDragging(false);
    };

    const volumePercentage = isDragging ? dragVolume * 100 : volume * 100;

    return (
        <div
            className={cn("flex h-10 justify-center items-center group/volume", className)}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
        >
            <div
                className={cn("relative p-2 w-10 h-10 z-[6] transition-opacity duration-300 text-white cursor-pointer")}
                onClick={onMuteToggle}
            >
                {/* Placeholder for sound icon */}
                <div
                    className={cn("opacity-0 w-full h-full flex items-center justify-center text-white", {
                        "opacity-100": isParentHovered || isMuted || volume === 0,
                    })}
                >
                    {isMuted || volume === 0 ? <FaVolumeMute size={24} /> : <HiSpeakerWave size={24} />}
                </div>
            </div>

            <div
                className={cn(
                    "w-16 h-6 relative bg-black/34 rounded-[32px] my-[7px] mx-2 cursor-pointer transition-all duration-300 ease-out origin-left-center",
                    "opacity-0 invisible scale-[0.3]",
                    "group-hover/volume:opacity-100 group-hover/volume:visible group-hover/volume:scale-100"
                )}
                ref={volumeRef}
                onMouseDown={handleStart}
                onTouchStart={handleStart}
            >
                <div className="w-12 h-0.5 bg-white/34 absolute cursor-pointer rounded border-l-2 border-r-2 left-2 right-2 top-[11px]">
                    <div
                        className="h-0.5 bg-white absolute cursor-pointer rounded origin-left-center top-1/2 left-0 -translate-y-1/2 z-[4]"
                        style={{ width: `${volumePercentage}%` }}
                    />
                    <div
                        className={cn(
                            "w-3 h-3 bg-white rounded-full absolute cursor-pointer z-[4] top-1/2 left-0 -translate-x-1/2 -translate-y-1/2",
                            isDragging ? "cursor-grabbing" : "cursor-grab"
                        )}
                        style={{ left: `${volumePercentage}%` }}
                    />
                </div>
            </div>
        </div>
    );
}

export default memo(VolumeBar);
