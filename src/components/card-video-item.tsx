"use client";

import { Audience } from "@/constants/enum";
import { TikTokPostType } from "@/types/schemas/TikTokPost.schemas";
import { formatCash } from "@/utils/formatting/formatNumber";
import { IoLockClosedOutline } from "react-icons/io5";
import Image from "next/image";
import React from "react";
import { CiHeart } from "react-icons/ci";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import PlayingIcon from "@/components/lottie-icons/playing";
import { HiOutlinePlay } from "react-icons/hi2";
import { FaRegHeart } from "react-icons/fa6";
import { timeAgo } from "@/utils/formatting/formatTime";
import { useLocale } from "next-intl";

export default function CardVideoItem({
    post,
    isDescriptionVisible = true,
    isCurrentlyPlaying = false,
}: {
    post: TikTokPostType;
    isDescriptionVisible?: boolean;
    isCurrentlyPlaying?: boolean;
}) {
    const author = post.author;
    const locale = useLocale();
    return (
        <article className="w-full">
            <div className={cn("relative block w-full pt-[133.333%] aspect-[3/4] overflow-hidden rounded-md group")}>
                {isCurrentlyPlaying && (
                    <div className="absolute inset-0 z-5 flex flex-col items-center justify-center bg-black/30 backdrop-blur-sm">
                        <PlayingIcon className="h-5.5 text-white" loop={true} />
                        <span className="text-white text-[13px] font-semibold mt-2">Now Playing</span>
                    </div>
                )}

                <div
                    className={cn(
                        "absolute inset-0 z-2 transition-opacity duration-300",
                        isCurrentlyPlaying ? "blur-sm brightness-75" : "group-hover:opacity-0"
                    )}
                >
                    <Image
                        src={post.thumbnail_url || "/images/desktop-wallpaper-tiktok.jpg"}
                        alt="video thumbnail"
                        className="w-full h-full object-cover"
                        width={100}
                        height={100}
                    />
                </div>

                <div
                    className={cn(
                        "absolute inset-0 opacity-0 transition-opacity duration-300 z-1",
                        !isCurrentlyPlaying && "group-hover:opacity-100 group-hover:z-2"
                    )}
                >
                    <video
                        autoPlay
                        muted
                        playsInline
                        loop
                        className="w-full h-full object-cover"
                        src={post.medias[0].url}
                    />
                </div>

                {!isDescriptionVisible && (
                    <div className="absolute bottom-0 left-0 w-full z-4 flex justify-between items-end px-3 pt-[67px] pb-[17px] h-[40%] bg-gradient-to-t from-[rgba(22,24,35,0.5)] via-transparent">
                        <div className="flex items-center gap-1.5">
                            <CiHeart className="text-white size-4.5" />
                            <span className="text-white font-semibold text-sm">
                                {formatCash.format(post.likes_count)}
                            </span>
                        </div>
                        {post.audience == Audience.PRIVATE ? (
                            <IoLockClosedOutline className="text-white size-4.5" />
                        ) : (
                            <span className="flex gap-1">
                                <HiOutlinePlay className="text-white size-4.5" />
                                <strong className="text-xs text-white">
                                    {formatCash.format(post.user_views + post.guest_views)}
                                </strong>
                            </span>
                        )}
                    </div>
                )}
            </div>

            {isDescriptionVisible && (
                <div className="mt-2">
                    <p className="text-sm line-clamp-2 mb-1">{post.content}</p>
                    <Link
                        href={`/${author.username}`}
                        className="text-sm font-semibold hover:underline text-muted-foreground"
                    >
                        {author.username}
                    </Link>
                    <p className="text-muted-foreground flex text-sm gap-1.5">
                        <span className="flex items-center gap-1">
                            <FaRegHeart className="size-3.5" />
                            {formatCash.format(post.likes_count)}
                        </span>
                        <span>·</span> <span>{timeAgo({ date: post.created_at, locale })}</span>
                    </p>
                </div>
            )}
        </article>
    );
}
