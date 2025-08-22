"use client";

import { TikTokPostType } from "@/types/schemas/TikTokPost.schemas";
import Image from "next/image";
import React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth-modal";
import useCurrentUserData from "@/hooks/data/useCurrentUserData";
import { useGetUserByUsernameQuery } from "@/services/RTK/user.services";
import { useFollowUser } from "@/hooks/data/useUser";
import { MdVerified } from "react-icons/md";
import { UserVerifyStatus } from "@/constants/enum";
import { Link } from "@/i18n/navigation";

function FollowButton({
    isFollowedState,
    onToggleFollow,
    isAuth,
}: {
    isFollowedState: boolean;
    onToggleFollow: () => void;
    isAuth: boolean;
}) {
    const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isAuth) {
            onToggleFollow();
        }
    };
    const content = (
        <Button
            variant={isFollowedState ? "outline" : "default"}
            className={cn(" h-9!  rounded-xs! font-semibold! cursor-pointer text-lg!", {
                "primary-button px-2! min-w-[164px] min-h-[36px] ": !isFollowedState,
            })}
            onClick={handleClick}
        >
            {isFollowedState ? "Following" : "Follow"}
        </Button>
    );
    return isAuth ? (
        content
    ) : (
        <AuthModal>
            <div className="relative">
                <button className="absolute inset-0 cursor-pointer" />
                {content}
            </div>
        </AuthModal>
    );
}

export default function CardVideoItem({ post }: { post: TikTokPostType }) {
    const author = post.author;
    const currentUser = useCurrentUserData();
    const isCurrentUser = currentUser?._id === author._id;
    const { data: userProfileRes } = useGetUserByUsernameQuery(author.username, { skip: isCurrentUser });
    const { isFollowedState, onToggleFollow } = useFollowUser({
        userId: author._id,
        initialFollowState: userProfileRes?.data.is_followed ?? false,
    });

    return (
        <article className="relative inline-block w-full pt-[133.333%] overflow-hidden rounded-md group">
            <Link href={`@${author.username}`}>
                <div className={cn("absolute inset-0 z-20 transition-opacity duration-300", "group-hover:opacity-0")}>
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
                        "absolute inset-0 opacity-0 transition-opacity duration-300 z-10",
                        "group-hover:opacity-100 group-hover:z-30"
                    )}
                >
                    <video autoPlay muted playsInline loop className="w-full h-full object-cover">
                        <source src={post.medias[0].url} />
                    </video>
                </div>
            </Link>

            <div className="absolute bottom-0 left-0 w-full z-40 px-3 pb-[17px] h-[60%] bg-gradient-to-t from-[rgba(22,24,35,0.6)] via-transparent flex flex-col justify-center items-center">
                <Avatar className="size-12 shrink-0">
                    <AvatarImage src={author.avatar} alt={author.name} />
                    <AvatarFallback>{author.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>

                <Link href={`@${author.username}`}>
                    <h4 className="text-lg text-white font-bold mt-2">{author.username}</h4>
                </Link>

                <div className="mb-2 flex items-center gap-1">
                    <h5 className="text-sm text-white font-semibold">{author.name}</h5>
                    {author.verify === UserVerifyStatus.VERIFIED && <MdVerified size={16} className="text-blue-500" />}
                </div>

                {!isCurrentUser && (
                    <FollowButton
                        isFollowedState={isFollowedState}
                        onToggleFollow={onToggleFollow}
                        isAuth={!!currentUser}
                    />
                )}
            </div>
        </article>
    );
}
