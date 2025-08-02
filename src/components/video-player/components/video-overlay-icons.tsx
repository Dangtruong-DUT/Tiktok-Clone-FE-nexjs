import React from "react";
import { FaCirclePause, FaCirclePlay } from "react-icons/fa6";
import { HiSpeakerWave } from "react-icons/hi2";
import { FaVolumeMute } from "react-icons/fa";

interface VideoOverlayIconsProps {
    showPlayPauseIcon: boolean;
    showMutedIcon: boolean;
    isPlaying: boolean;
    isMuted: boolean;
}

export function VideoOverlayIcons({ showPlayPauseIcon, showMutedIcon, isPlaying, isMuted }: VideoOverlayIconsProps) {
    const iconClasses =
        "absolute top-1/2 left-1/2 text-[clamp(3.2rem,3vw+1rem,4.8rem)] bg-black text-white w-[1.5em] h-[1.5em] flex items-center justify-center rounded-full animate-[popup_500ms_ease-out_forwards] -translate-x-1/2 -translate-y-1/2 origin-top-left";

    return (
        <>
            {/* Play/Pause Overlay Icon */}
            {showPlayPauseIcon && (
                <div className={iconClasses}>
                    {!isPlaying ? (
                        <span>
                            <FaCirclePause />
                        </span>
                    ) : (
                        <span>
                            <FaCirclePlay />
                        </span>
                    )}
                </div>
            )}

            {/* Muted Overlay Icon */}
            {showMutedIcon && <div className={iconClasses}>{isMuted ? <FaVolumeMute /> : <HiSpeakerWave />}</div>}
        </>
    );
}
