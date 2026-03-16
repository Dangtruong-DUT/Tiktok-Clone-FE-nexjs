import React from "react";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/utils/formatting/formatTime";
import { TikTokPostType } from "@/types/schemas/TikTokPost.schemas";
import { UserType } from "@/types/schemas/User.schema";
import ProgressBar from "./progress-bar";
import VideoDescription from "@/components/video-player/components/video-description";

interface VideoControlsBottomProps {
    post: TikTokPostType;
    author: UserType;
    locale: "en" | "vi";
    currentTime: number;
    duration: number;
    isProgressBarActive: boolean;
    onSeek: (time: number) => void;
    onProgressBarActive: (active: boolean) => void;
    onPlayPause?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

export function VideoControlsBottom({
    post,
    author,
    locale,
    currentTime,
    duration,
    isProgressBarActive,
    onSeek,
    onProgressBarActive,
}: VideoControlsBottomProps) {
    return (
        <div className="absolute bottom-0 left-0  flex justify-end flex-col z-[5] rounded-b-2xl w-full  bg-black/2">
            <div
                className={cn(
                    "flex-grow justify-start text-white px-3 pb-4 w-full relative transition-all duration-200 ease-out",
                    isProgressBarActive ? "opacity-0 invisible" : "opacity-100 visible"
                )}
            >
                <a
                    href={`@${author.username}`}
                    className="flex items-center gap-[1.2rem] text-nowrap font-medium text-sm leading-[1.29] my-2"
                >
                    <h3 className="inline-block text-sm font-medium leading-[1.29] relative hover:underline after:content-['.'] after:absolute after:flex after:justify-center after:items-center after:-top-0.5 after:-right-[calc(0.6rem+2px)] after:z-[1] after:bg-transparent">
                        {author.username}
                    </h3>
                    <span className="text-sm opacity-70">{timeAgo({ locale, date: post.created_at })}</span>
                </a>
                <VideoDescription description={post.content} />
            </div>
            <ProgressBar currentTime={currentTime} duration={duration} onSeek={onSeek} onActive={onProgressBarActive} />
        </div>
    );
}
