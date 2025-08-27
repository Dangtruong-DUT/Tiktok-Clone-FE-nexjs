import ProgressBar from "@/components/video-player-v3/components/progress-bar";
import VolumeBar from "@/components/video-player-v3/components/volume-bar";
import { cn } from "@/lib/utils";
import { TikTokPostType } from "@/types/schemas/TikTokPost.schemas";
import { formatSecondsToTime } from "@/utils/formatting/formatTime";
import { FaPause, FaPlay } from "react-icons/fa6";

interface VideoControlsBottomProps {
    post: TikTokPostType;
    locale: "en" | "vi";
    currentTime: number;
    duration: number;
    isProgressBarActive: boolean;
    onSeek: (time: number) => void;
    onProgressBarActive: (active: boolean) => void;
    onPlayPause: () => void;
    onMuteToggle: () => void;
    isPlaying: boolean;
    isMuted: boolean;
    volume: number;
    onVolumeChange: (volume: number) => void;
    isHovered: boolean;
}

export function VideoControlsBottom({
    currentTime,
    duration,
    onSeek,
    onProgressBarActive,
    onPlayPause,
    isPlaying,
    isMuted,
    onMuteToggle,
    volume,
    onVolumeChange,
    isHovered,
}: VideoControlsBottomProps) {
    return (
        <div
            className={cn(
                "absolute opacity-80 bottom-0 left-0 bg-transparent flex justify-end flex-col z-[2] rounded-b-2xl w-full ",
                {
                    "opacity-100": isHovered,
                }
            )}
        >
            <ProgressBar currentTime={currentTime} duration={duration} onSeek={onSeek} onActive={onProgressBarActive} />
            <div className="h-6 my-3.5 flex justify-between px-7">
                <div className="flex items-center space-x-2">
                    <button onClick={onPlayPause} className="text-white [&>svg]:size-6">
                        {isPlaying ? <FaPlay /> : <FaPause />}
                    </button>
                    <div className="text-white text-sm">
                        <span>{formatSecondsToTime(currentTime)}</span>
                        <span className="mx-1">/</span>
                        <span>{formatSecondsToTime(duration)}</span>
                    </div>
                </div>
                <VolumeBar
                    onVolumeChange={onVolumeChange}
                    volume={volume}
                    isMuted={isMuted}
                    onMuteToggle={onMuteToggle}
                />
            </div>
        </div>
    );
}
