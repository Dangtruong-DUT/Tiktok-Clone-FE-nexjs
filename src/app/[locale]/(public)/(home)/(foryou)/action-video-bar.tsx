"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TikTokPostType } from "@/types/schemas/TikTokPost.schemas";
import { UserType } from "@/types/schemas/User.schema";
import { formatCash } from "@/utils/formating/formatNumber";
import { Button } from "@/components/ui/button";
import { BookmarkIcon, Check, MessageCircleMore, Plus } from "lucide-react";
import { FaBookmark, FaHeart, FaShare } from "react-icons/fa6";
import LazyLottie from "@/components/lazy-lottie";
import LikedIcon from "@/app/[locale]/(public)/(home)/(foryou)/liked-icon";

interface ActionBarProps {
    post: TikTokPostType;
    author: UserType;
    className?: string;
}

export default function ActionBar({ post, author, className }: ActionBarProps) {
    const [liked, setLiked] = useState(post.is_liked);
    const [saved, setSaved] = useState(post.is_bookmarked);
    const [following, setFollowing] = useState(false);

    const handleLike = () => setLiked(!liked);
    const handleSave = () => setSaved(!saved);
    const handleFollow = () => setFollowing(!following);

    return (
        <section className={cn("flex flex-col items-center justify-center flex-shrink-0 p-4", className)}>
            {/* Avatar with Follow Button */}
            <div className="relative flex flex-col items-center mb-4 text-5xl">
                <Avatar className="w-[1em] h-[1em] rounded-full ">
                    <AvatarImage src={author.avatar} alt={author.username} />
                    <AvatarFallback className="text-sm font-medium">
                        {author.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>

                <Button
                    variant="secondary"
                    onClick={handleFollow}
                    className={cn(
                        "absolute bottom-0 block text-white/90 hover:bg-brand/90",
                        "p-0 flex items-center justify-center w-[0.5em] h-[0.5em] aspect-square rounded-full transition-all duration-200 bg-brand outline-1 outline-offset-2 outline-brand",
                        following && "text-brand border-white bg-accent hover:bg-accent/90"
                    )}
                >
                    {following ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </Button>
            </div>

            {/* Like Button */}
            <div className="flex flex-col gap-2 items-center mb-6">
                <Button
                    variant="secondary"
                    onClick={handleLike}
                    className={cn(
                        "p-0 flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200",
                        "text-white/90 hover:bg-white/10 active:bg-white/20",
                        liked && "text-red-500"
                    )}
                >
                    {liked ? <LikedIcon /> : <FaHeart width={50} height={50} />}
                </Button>
                <strong className="text-white text-xs font-bold text-center leading-tight">
                    {post.likes_count ? formatCash.format(post.likes_count) : "Like"}
                </strong>
            </div>

            {/* Comment Button */}
            <div className="flex flex-col items-center mb-6 w-12 h-12 rounded-full">
                <Button variant="secondary" onClick={() => {}} className="w-12 h-12 text-2xl mb-2">
                    <MessageCircleMore />
                </Button>
                <strong className="text-white text-xs font-bold text-center leading-tight">
                    {post.comment_count ? formatCash.format(post.comment_count) : "Comment"}
                </strong>
            </div>

            {/* Bookmark Button */}
            <div className="flex flex-col items-center mb-6">
                <Button variant="secondary" onClick={handleSave} className="w-12 h-12 text-2xl mb-2 rounded-full p-0">
                    {saved ? <BookmarkIcon /> : <FaBookmark />}
                </Button>
                <strong className="text-white text-xs font-bold text-center leading-tight">
                    {post.bookmarks_count ? formatCash.format(post.bookmarks_count) : "Save"}
                </strong>
            </div>

            {/* Share Button */}
            <div className="flex flex-col items-center">
                <Button variant="secondary" onClick={() => {}} className="w-12 h-12 text-2xl mb-2 rounded-full">
                    <FaShare />
                </Button>
                <strong className="text-white text-xs font-bold text-center leading-tight">
                    {post.user_views + post.guest_views
                        ? formatCash.format(post.user_views + post.guest_views)
                        : "Share"}
                </strong>
            </div>
        </section>
    );
}
