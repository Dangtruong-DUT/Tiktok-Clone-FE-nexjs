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

export default function CardVideoItem({
    post,
    author,
    isDescriptionVisible = true,
}: {
    post: TikTokPostType;
    author: UserType;
    isDescriptionVisible?: boolean;
}) {
    const thumbnailUrl = useThumbnailGenerator(post.medias[0].url);

    return (
        <article className="w-full gap-2">
            <div className=" inline-block relative w-full bg-gray-300 pt-[133.333%] overflow-hidden rounded-md group flex-1">
                <div className="absolute top-0 left-0 w-full h-full">
                    <div className="absolute top-0 left-0 w-full h-full z-20 transition-opacity duration-300 ease-in-out group-hover:opacity-0">
                        <Image
                            src={thumbnailUrl}
                            alt="video thumbnail"
                            className="w-full h-full object-cover"
                            width={100}
                            height={100}
                        />
                    </div>

                    <div className="absolute top-0 left-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out z-10 group-hover:z-30">
                        <video autoPlay muted playsInline loop className="w-full h-full object-cover">
                            <source src={post.medias[0].url} />
                        </video>
                    </div>

                    <div className="absolute bottom-0 left-0 w-full z-40 flex justify-between items-end px-3 pt-[67px] pb-[17px] h-[40%] bg-gradient-to-t from-[rgba(22,24,35,0.5)] via-transparent">
                        <div className="flex items-center gap-1.5">
                            <CiHeart className="text-white size-4.5" />
                            <span className="text-white font-semibold text-sm">
                                {formatCash.format(post.likes_count)}
                            </span>
                        </div>
                        {post.audience !== Audience.PRIVATE && <IoLockClosedOutline className="text-white size-4.5" />}
                    </div>
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
