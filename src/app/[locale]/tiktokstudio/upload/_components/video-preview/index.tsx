"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useCurrentUserData from "@/hooks/data/useCurrentUserData";
import { useVideoPlayer } from "@/hooks/video/useVideoPlayer";
import { useVideoControls } from "@/hooks/video/useVideoControls";
import { timeToMMSSCS } from "@/utils/formatting/formatTime";
import Image from "next/image";
import { useRef } from "react";
import { AiFillMuted } from "react-icons/ai";
import { FaPause, FaPlay } from "react-icons/fa6";
import { ImVolumeMute2 } from "react-icons/im";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface VideoPreviewProps {
    videoSrc: string;
    content: string;
}

export default function VideoPreview({ videoSrc, content }: VideoPreviewProps) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const { isPlaying, setIsPlaying, isMuted, setIsMuted, currentTime, duration } = useVideoPlayer(videoRef);
    const currentUserData = useCurrentUserData();

    const { handlePlayPause, handleMuteToggle } = useVideoControls({
        videoRef,
        isPlaying,
        isMuted,
        setIsPlaying,
        setIsMuted,
        setVolume: () => {},
    });

    return (
        <div className="w-[264px] h-[571px] bg-transparent relative border-2 rounded-[20px] border-border group">
            <div className="absolute block inset-0 w-full h-full bg-black rounded-[20px] z-1">
                <Image
                    src={"/images/upload-page/bottom-video-player.png"}
                    width={264}
                    height={34}
                    className="absolute bottom-[20px] left-0 block w-full"
                    alt="control bar mobile"
                />
            </div>
            <div className="absolute top-0 left-0 inset-0 z-2">
                <div className="relative h-[511px] w-full">
                    <video
                        ref={videoRef}
                        className="w-full  h-[511px]  object-cover rounded-t-[20px]"
                        muted={isMuted}
                        autoPlay
                        loop
                        playsInline
                    >
                        <source src="/videos/video1.mp4" type="video/mp4" />
                    </video>
                    <div className="absolute  top-1 left-0 flex flex-col items-center gap-1  w-full">
                        <Image
                            src={"/images/upload-page/status-bar-mobile.png"}
                            width={264}
                            height={32}
                            className="inline-block w-full h-8"
                            alt="status bar mobile"
                        />
                        <Image
                            src={"/images/upload-page/navigation-bar-mobile.png"}
                            width={264}
                            height={32}
                            className="inline-block w-full h-8"
                            alt="control bar mobile"
                        />
                    </div>
                    <div className="absolute right-1 bottom-9 flex flex-col items-center w-9 ">
                        <Avatar className="size-8 border-1 border-white ">
                            <AvatarImage src={currentUserData?.avatar} alt={currentUserData?.username} />
                            <AvatarFallback>{currentUserData?.name.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <Image
                            src={"/images/upload-page/action-bar-tiktok.png"}
                            width={25}
                            height={174}
                            className="inline-block w-[25px] h-[174px] mt-5"
                            alt="action bar tiktok"
                        />
                    </div>
                    <div className="absolute left-1 bottom-4 flex flex-col w-[70%] ">
                        <span className="text-white inline-block w-full font-bold text-xs overflow-ellipsis overflow-hidden whitespace-nowrap">
                            {currentUserData?.username}
                        </span>
                        <span className="text-white inline-block w-full font-normal text-xs overflow-ellipsis overflow-hidden whitespace-nowrap">
                            {content}
                        </span>
                    </div>
                </div>
                <div className="absolute top-0 left-0 inset-0 z-2 opacity-0   group-hover:opacity-100 transition-opacity duration-300 w-full h-full  ">
                    <div className="absolute bottom-6 h-[30px]  block w-full  bg-linear-to-b from-transparent to-black  ">
                        <div className="px-4 text-white">
                            <div></div>
                            <div className="flex justify-between items-center">
                                <div className="text-xs font-medium [&>svg]:size-[14px] flex items-center gap-2">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span onClick={handlePlayPause} className=" [&>svg]:size-[14px]   ">
                                                {isPlaying ? <FaPause /> : <FaPlay />}
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{isPlaying ? "Pause" : "Play"}</p>
                                        </TooltipContent>
                                    </Tooltip>

                                    <span>
                                        {timeToMMSSCS(currentTime)}/{timeToMMSSCS(duration)}
                                    </span>
                                </div>
                                <div>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span className=" [&>svg]:size-[14px]   " onClick={handleMuteToggle}>
                                                {isMuted ? <ImVolumeMute2 /> : <AiFillMuted />}
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{isMuted ? "Unmute" : "Mute"}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                            </div>
                        </div>

                        <div className="absolute block h-[205px]   w-full left-0 bottom-0 overflow-hidden  bg-linear-to-b from-transparent to-black z-[-1] " />
                    </div>
                </div>
            </div>
        </div>
    );
}
