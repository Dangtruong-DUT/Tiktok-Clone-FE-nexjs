"use client";

import React, { startTransition, useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FaBookmark, FaHeart, FaShare } from "react-icons/fa6";
import LikedIcon from "@/components/lottie-icons/liked-icon";
import BookmarkIcon from "@/components/lottie-icons/bookmark-icon";
import { formatCash } from "@/utils/formatting/formatNumber";
import { TikTokPostType } from "@/types/schemas/TikTokPost.schemas";
import { UserType } from "@/types/schemas/User.schema";
import { AiFillMessage } from "react-icons/ai";

interface ActionBarProps {
    post: TikTokPostType;
    author: UserType;
    className?: string;
}

interface ActionButtonProps {
    icon: React.ReactNode;
    count: number | null;
    label: string;
    onClick?: () => void;
    className?: string;
}

function ActionButton({ icon, count, label, onClick, className }: ActionButtonProps) {
    return (
        <div className="flex flex-col items-center">
            <Button
                variant="ghost"
                onClick={onClick}
                className={cn(
                    "text-5xl size-[1em] rounded-full flex items-center justify-center",
                    "transition-all duration-200 text-white! hover:bg-transparent!",
                    className
                )}
                size="icon"
            >
                {icon}
            </Button>
            <span className=" text-sm font-bold text-center text-white">
                {count ? formatCash.format(count) : label}
            </span>
        </div>
    );
}

export default function ActionBar({ post, className }: ActionBarProps) {
    const [liked, setLiked] = useState(post.is_liked);
    const [saved, setSaved] = useState(post.is_bookmarked);

    const toggle = (setter: React.Dispatch<React.SetStateAction<boolean>>) =>
        startTransition(() => setter((prev) => !prev));

    const handleOpenComment = useCallback(() => {
        window.scrollTo({
            top: 500,
            behavior: "smooth",
        });
    }, []);

    return (
        <section className={cn("flex flex-col items-center relative", className)}>
            <ActionButton
                icon={liked ? <LikedIcon className="absolute size-[1.5em]! " /> : <FaHeart className="size-[0.5em]" />}
                count={post.likes_count}
                label="Like"
                onClick={() => toggle(setLiked)}
                className={liked ? "text-red-500" : ""}
            />

            <ActionButton
                icon={<AiFillMessage className="size-[0.5em]" />}
                count={post.comment_count}
                label="Comment"
                onClick={handleOpenComment}
            />
            <ActionButton
                icon={
                    saved ? (
                        <BookmarkIcon className=" absolute size-[0.8em]!" />
                    ) : (
                        <FaBookmark className="size-[0.5em]" />
                    )
                }
                count={post.bookmarks_count}
                label="Save"
                onClick={() => toggle(setSaved)}
            />

            <ActionButton
                icon={<FaShare className="size-[0.5em]" />}
                count={post.user_views + post.guest_views}
                label="Share"
                onClick={() => {}}
            />
        </section>
    );
}
