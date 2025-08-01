"use client";

import React, { memo, useRef, useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import ProgressBar from "./ProgressBar";
import VolumeBar from "@/components/video-player/volume-bar";
import VideoDescription from "@/components/video-player/video-description";
import { FaCirclePause, FaCirclePlay } from "react-icons/fa6";
import { HiSpeakerWave } from "react-icons/hi2";
import { FaVolumeMute } from "react-icons/fa";
import { timeAgo } from "@/utils/formating/formatTime";
import { useLocale } from "next-intl";

interface VideoSource {
    file_url: string;
    type: string;
    author: string;
    user: {
        nickname: string;
    };
    description: string;
    created_at: string;
}

interface VideoPlayerProps {
    sources: VideoSource | VideoSource[];
    className?: string;
}

function VideoPlayer({ sources = [], className }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const [isInViewport, setIsInViewport] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true);
    const [showPlayPauseIcon, setShowPlayPauseIcon] = useState(false);
    const [showMutedIcon, setShowMutedIcon] = useState(false);
    const [isProgressBarActive, setIsProgressBarActive] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const locale = useLocale();

    // Ensure sources is always an array
    const sourcesArray = Array.isArray(sources) ? sources : [sources];
    const primarySource = sourcesArray[0];

    useEffect(() => {
        const video = videoRef.current;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInViewport(true);
                    if (video) {
                        video.play().catch((error) => {
                            console.error("Error attempting to play video:", error);
                        });
                    }
                } else {
                    setIsInViewport(false);
                    if (video) {
                        video.pause();
                    }
                }
            },
            {
                threshold: 0.5,
            }
        );

        if (video) {
            observer.observe(video);
        }

        const handleVisibilityChange = () => {
            if (document.hidden) {
                if (video) {
                    video.pause();
                }
            } else {
                if (isInViewport && video) {
                    video.play().catch((error) => {
                        console.error("Error attempting to play video:", error);
                    });
                }
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            if (video) {
                observer.unobserve(video);
            }
        };
    }, [isInViewport]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const updateTime = () => {
            setCurrentTime(video.currentTime);
        };

        const updateDuration = () => {
            setDuration(video.duration);
        };

        video.addEventListener("timeupdate", updateTime);
        video.addEventListener("loadedmetadata", updateDuration);

        return () => {
            video.removeEventListener("timeupdate", updateTime);
            video.removeEventListener("loadedmetadata", updateDuration);
        };
    }, []);

    const handlePlayPause = (event: React.MouseEvent<HTMLVideoElement | HTMLDivElement>) => {
        if (event.target !== videoRef.current) {
            return;
        }
        if (videoRef.current) {
            if (videoRef.current.paused) {
                videoRef.current.play().catch((error) => {
                    console.error("Error attempting to play video:", error);
                });
            } else {
                videoRef.current.pause();
            }
            setIsPlaying(!isPlaying);
            setShowPlayPauseIcon(true);
            setTimeout(() => {
                setShowPlayPauseIcon(false);
            }, 500);
        }
    };

    const handleSeek = useCallback((time: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime = time;
            setCurrentTime(time);
        }
    }, []);

    const handleMuteToggle = useCallback((newMutedState: boolean) => {
        setIsMuted(newMutedState);
        setShowMutedIcon(true);
        if (videoRef.current) {
            videoRef.current.muted = newMutedState;
        }
        setTimeout(() => {
            setShowMutedIcon(false);
        }, 500);
    }, []);

    const handleVolumeChange = useCallback((newVolume: number) => {
        setVolume(newVolume);
        if (newVolume === 0) {
            setIsMuted(true);
            setShowMutedIcon(true);
            setTimeout(() => {
                setShowMutedIcon(false);
            }, 500);
        } else {
            setIsMuted(false);
        }
        if (videoRef.current) {
            videoRef.current.volume = newVolume;
        }
    }, []);

    const handleProgressBarActive = useCallback((active: boolean) => {
        setIsProgressBarActive(active);
    }, []);

    return (
        <div className={cn("relative cursor-pointer", className)}>
            <section
                className="block absolute top-0 left-0 w-full h-full group"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Video Controls Top */}
                <div className="absolute top-0 flex flex-row items-start w-full z-[2] bg-transparent rounded-t-2xl">
                    <VolumeBar
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        volume={volume}
                        onVolumeChange={handleVolumeChange}
                        isMuted={isMuted}
                        onMuteToggle={handleMuteToggle}
                        isParentHovered={isHovered}
                    />
                </div>

                {/* Play/Pause Overlay Icon */}
                {showPlayPauseIcon && (
                    <div className="absolute top-1/2 left-1/2 text-[clamp(3.2rem,3vw+1rem,4.8rem)] bg-black text-white w-[1.5em] h-[1.5em] flex items-center justify-center rounded-full animate-[popup_500ms_ease-out_forwards] -translate-x-1/2 -translate-y-1/2 origin-top-left">
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
                {showMutedIcon && (
                    <div className="absolute top-1/2 left-1/2 text-[clamp(3.2rem,3vw+1rem,4.8rem)] bg-black text-white w-[1.5em] h-[1.5em] flex items-center justify-center rounded-full animate-[popup_500ms_ease-out_forwards] -translate-x-1/2 -translate-y-1/2 origin-top-left">
                        {isMuted ? <FaVolumeMute /> : <HiSpeakerWave />}
                    </div>
                )}

                {/* Video Element */}
                <video
                    onClick={handlePlayPause}
                    className="w-full aspect-[9/16] rounded-2xl object-cover"
                    ref={videoRef}
                    playsInline
                    loop
                    muted={isMuted}
                >
                    {sourcesArray.map((source, index) => (
                        <source key={index} src={source.file_url} type={source.type} />
                    ))}
                    Your browser does not support the video tag.
                </video>

                {/* Video Controls Bottom */}
                <div
                    className="absolute bottom-0 bg-transparent flex justify-end flex-col z-[2] rounded-b-2xl w-full"
                    onClick={handlePlayPause}
                >
                    <div
                        className={cn(
                            "flex-grow justify-start text-white px-3 pb-4 w-full relative transition-all duration-200 ease-out",
                            isProgressBarActive ? "opacity-0 invisible" : "opacity-100 visible"
                        )}
                    >
                        <a
                            href={`@${primarySource.author}`}
                            className="flex items-center gap-[1.2rem] text-nowrap font-medium text-sm leading-[1.29] my-2"
                        >
                            <h3 className="inline-block text-sm font-medium leading-[1.29] relative hover:underline after:content-['.'] after:absolute after:flex after:justify-center after:items-center after:-top-0.5 after:-right-[calc(0.6rem+2px)] after:z-[1] after:bg-transparent">
                                {primarySource.user.nickname}
                            </h3>
                            <span className="text-sm opacity-70">
                                {timeAgo({ locale, date: primarySource.created_at })}
                            </span>
                        </a>
                        <VideoDescription description={primarySource.description} />
                    </div>
                    <ProgressBar
                        className="group"
                        currentTime={currentTime}
                        duration={duration}
                        onSeek={handleSeek}
                        onActive={handleProgressBarActive}
                    />
                </div>
            </section>
        </div>
    );
}

export default memo(VideoPlayer);
