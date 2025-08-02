import React from "react";
import { FaCirclePause, FaCirclePlay } from "react-icons/fa6";
import { HiSpeakerWave } from "react-icons/hi2";
import { FaPlayCircle, FaVolumeMute } from "react-icons/fa";

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
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 w-[4.5rem] text-[clamp(3.2rem,3vw+1rem,4.8rem)] -translate-y-1/2 z-[3] text-white  animate-popup origin-center">
                    {!isPlaying ? <FaCirclePause className="w-[1.5em]" /> : <FaPlayCircle className=" w-[1.5em]" />}
                </div>
            )}
            {/* Muted Overlay Icon */}
            {showMutedIcon && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 text-[clamp(3.2rem,3vw+1rem,4.8rem)] -translate-y-1/2 z-[3] text-white animate-popup origin-center ">
                    {isMuted ? <FaVolumeMute className=" w-[1.5em]" /> : <HiSpeakerWave className="w-[1.5em]" />}
                </div>
            )}
        </>
    );
}
