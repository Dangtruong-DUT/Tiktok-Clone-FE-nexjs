import React from "react";
import VolumeBar from "./volume-bar";

interface VideoControlsTopProps {
    volume: number;
    onVolumeChange: (volume: number) => void;
    isMuted: boolean;
    onMuteToggle: () => void;
    isParentHovered: boolean;
}

export function VideoControlsTop({
    volume,
    onVolumeChange,
    isMuted,
    onMuteToggle,
    isParentHovered,
}: VideoControlsTopProps) {
    return (
        <div className="absolute top-0 flex flex-row items-start w-full z-[2] bg-transparent rounded-t-2xl">
            <VolumeBar
                volume={volume}
                onVolumeChange={onVolumeChange}
                isMuted={isMuted}
                onMuteToggle={onMuteToggle}
                isParentHovered={isParentHovered}
            />
        </div>
    );
}
