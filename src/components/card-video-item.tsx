"use client";

import { Audience } from "@/constants/enum";
import useThumbnailGenerator from "@/hooks/ui/generateVideoThumbnail";
import { TikTokPostType } from "@/types/schemas/TikTokPost.schemas";
import { formatCash } from "@/utils/formatting/formatNumber";
import { IoLockClosedOutline } from "react-icons/io5";
import Image from "next/image";
import React from "react";
import { CiHeart } from "react-icons/ci";
import { UserType } from "@/types/schemas/User.schema";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import PlayingIcon from "@/components/lottie-icons/playing";

export default function CardVideoItem({
    post,
    author,
    isDescriptionVisible = true,
    isCurrentlyPlaying = false,
}: {
    post: TikTokPostType;
    author: UserType;
    isDescriptionVisible?: boolean;
    isCurrentlyPlaying?: boolean;
}) {
    const thumbnailUrl = useThumbnailGenerator(post.medias[0].url);

    return (
        <article className="w-full gap-2 ">
            <div className={cn("relative inline-block w-full pt-[133.333%] overflow-hidden rounded-md group")}>
                {isCurrentlyPlaying && (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/30 backdrop-blur-sm">
                        <PlayingIcon className="h-5.5 text-white" loop={true} />
                        <span className="text-white text-[13px] font-semibold mt-2">Now Playing</span>
                    </div>
                )}

                <div
                    className={cn(
                        "absolute inset-0 z-20 transition-opacity duration-300",
                        isCurrentlyPlaying ? "blur-sm brightness-75" : "group-hover:opacity-0"
                    )}
                >
                    <Image
                        src={thumbnailUrl}
                        alt="video thumbnail"
                        className="w-full h-full object-cover"
                        width={100}
                        height={100}
                    />
                </div>

                <div
                    className={cn(
                        "absolute inset-0 opacity-0 transition-opacity duration-300 z-10",
                        !isCurrentlyPlaying && "group-hover:opacity-100 group-hover:z-30"
                    )}
                >
                    <video autoPlay muted playsInline loop className="w-full h-full object-cover">
                        <source src={post.medias[0].url} />
                    </video>
                </div>

                <div className="absolute bottom-0 left-0 w-full z-40 flex justify-between items-end px-3 pt-[67px] pb-[17px] h-[40%] bg-gradient-to-t from-[rgba(22,24,35,0.5)] via-transparent">
                    <div className="flex items-center gap-1.5">
                        <CiHeart className="text-white size-4.5" />
                        <span className="text-white font-semibold text-sm">{formatCash.format(post.likes_count)}</span>
                    </div>
                    {post.audience !== Audience.PRIVATE && <IoLockClosedOutline className="text-white size-4.5" />}
                </div>
            </div>

            {isDescriptionVisible && (
                <Link href={`/${author.username}`} className="flex items-center gap-2 mt-2 py-2 w-full">
                    <Avatar className="size-6">
                        <AvatarImage src={author.avatar} alt={author.username} />
                        <AvatarFallback>{author.username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="text-base font-semibold truncate hover:underline">{author.username}</span>
                </Link>
            )}
        </article>
    );
}
