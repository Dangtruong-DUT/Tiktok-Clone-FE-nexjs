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

function VolumeBar({ className, volume, onVolumeChange, isMuted, onMuteToggle }: VolumeBarProps) {
    const volumeRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragVolume, setDragVolume] = useState(volume);

    const calculateVolumeFromEvent = (event: MouseEvent | TouchEvent): number => {
        if (!volumeRef.current) return volume;

        const rect = volumeRef.current.getBoundingClientRect();
        const clientY = "touches" in event ? event.touches[0].clientY : event.clientY;
        const offsetY = Math.min(Math.max(clientY - rect.top, 0), rect.height);
        return 1 - offsetY / rect.height;
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

    const volumePercentage = (isDragging ? dragVolume : volume) * 100;

    return (
        <div
            className={cn("flex flex-col items-center group/volume relative", className)}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
        >
            <button
                className={cn(
                    "relative z-[10] transition-opacity duration-300 cursor-pointer text-white [&>svg]:size-6"
                )}
                onClick={onMuteToggle}
            >
                {isMuted || volume === 0 ? <FaVolumeMute /> : <HiSpeakerWave />}
            </button>
            <div className="absolute w-6  h-10 -top-10 z-[5] pointer-events-auto group-hover/volume:block hidden" />
            <div
                className={cn(
                    "absolute -top-30 block w-6 h-26 bg-gray-900 rounded-full transition-all duration-300 ease-out origin-top",
                    "opacity-0 invisible scale-[0.3] pointer-events-none",
                    "group-hover/volume:pointer-events-auto",
                    "group-hover/volume:opacity-100 group-hover/volume:visible group-hover/volume:scale-100",
                    "group-hover/volume:hover:opacity-100 group-hover/volume:hover:visible group-hover/volume:hover:scale-100 z-50 "
                )}
                ref={volumeRef}
                onMouseDown={handleStart}
                onTouchStart={handleStart}
            >
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2  w-0.5 h-[80%] bg-white/34 rounded">
                    <div
                        className="absolute left-1/2 -translate-x-1/2 w-0.5 bg-white origin-bottom rounded"
                        style={{ height: `${volumePercentage}%`, bottom: 0 }}
                    />
                    <div
                        className={cn(
                            "w-3 h-3 bg-white rounded-full absolute left-1/2 -translate-x-1/2 z-[4]",
                            isDragging ? "cursor-grabbing" : "cursor-grab"
                        )}
                        style={{ bottom: `calc(${volumePercentage}% - 6px)` }}
                    />
                </div>
            </div>
        </div>
    );
}

export default memo(VolumeBar);
