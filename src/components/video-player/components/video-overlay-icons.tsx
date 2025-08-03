import React from "react";
import MaterialSymbolsPlayCircleRounded from "@/components/icons/MaterialSymbolsPlayCircleRounded";
import MaterialSymbolsPauseCircle from "@/components/icons/MaterialSymbolsPauseCircle";
import MaterialSymbolsNoSoundRounded from "@/components/icons/MaterialSymbolsNoSoundRounded";
import MaterialSymbolsVolumeUpRoundedAnimated from "@/components/icons/MaterialSymbolsVolumeUpRounded";

interface VideoOverlayIconsProps {
    showPlayPauseIcon: boolean;
    showMutedIcon: boolean;
    isPlaying: boolean;
    isMuted: boolean;
}

export function VideoOverlayIcons({ showPlayPauseIcon, showMutedIcon, isPlaying, isMuted }: VideoOverlayIconsProps) {
    return (
        <>
            {/* Play/Pause Overlay Icon */}
            {showPlayPauseIcon && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 w-[4.5rem] text-[clamp(3.2rem,3vw+1rem,4.8rem)] -translate-y-1/2 z-[3] text-black origin-center  animate-popup ">
                    {!isPlaying ? (
                        <MaterialSymbolsPauseCircle className="w-[1.5em]" />
                    ) : (
                        <MaterialSymbolsPlayCircleRounded className=" w-[1.5em]" />
                    )}
                </div>
            )}
            {/* Muted Overlay Icon */}
            {showMutedIcon && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 text-[clamp(3.2rem,3vw+1rem,4.8rem)] -translate-y-1/2 z-[3] text-black origin-center animate-popup  ">
                    {isMuted ? (
                        <MaterialSymbolsNoSoundRounded className=" w-[1.5em]" />
                    ) : (
                        <MaterialSymbolsVolumeUpRoundedAnimated className="w-[1.5em]" />
                    )}
                </div>
            )}
        </>
    );
}
