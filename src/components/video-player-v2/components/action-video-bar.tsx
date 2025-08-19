"use client";

import React, { useCallback, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FaBookmark, FaHeart, FaShare } from "react-icons/fa6";
import LikedIcon from "@/components/lottie-icons/liked-icon";
import BookmarkIcon from "@/components/lottie-icons/bookmark-icon";
import { formatCash } from "@/utils/formatting/formatNumber";
import { TikTokPostType } from "@/types/schemas/TikTokPost.schemas";
import { AiFillMessage } from "react-icons/ai";
import { useBookmarkPost, useLikePost } from "@/hooks/data/useVideo";
import { useGetPostDetailQuery } from "@/services/RTK/posts.services";

interface ActionBarProps {
    post: TikTokPostType;
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
                    "transition-all duration-200 text-white! hover:bg-transparent! cursor-pointer",
                    className
                )}
                size="icon"
            >
                {icon}
            </Button>
            <span className=" text-xs font-semibold text-center text-white">
                {count ? formatCash.format(count) : label}
            </span>
        </div>
    );
}

export default function ActionBar({ post, className }: ActionBarProps) {
    const { data: postDetailRes } = useGetPostDetailQuery(post._id);
    const postDetail = postDetailRes?.data;

    const [isOpenAnimatingLike, setIsOpenAnimatingLike] = useState<boolean>(false);
    const { isLikedState, toggleLikeState } = useLikePost({
        postId: post._id,
        initialLikeState: postDetail?.is_liked || false,
        onLiked: () => {
            setIsOpenAnimatingLike(true);
            setTimeout(() => setIsOpenAnimatingLike(false), 3000);
        },
    });

    const [isOpenAnimatingBookmark, setIsOpenAnimatingBookmark] = useState<boolean>(false);
    const { isBookmarkedState, toggleBookmarkState } = useBookmarkPost({
        postId: post._id,
        initialBookmarkState: postDetail?.is_bookmarked || false,
        onBookmarked: () => {
            setIsOpenAnimatingBookmark(true);
            setTimeout(() => setIsOpenAnimatingBookmark(false), 3000);
        },
    });

    const handleOpenComment = useCallback(() => {
        const commentSection = document.getElementById(`comment-section-${post._id}`);
        if (commentSection) {
            commentSection.scrollIntoView({ behavior: "smooth" });
        }
    }, [post._id]);

    const shares_count = useMemo(() => {
        if (postDetail) return postDetail.quote_post_count + postDetail.repost_count;
        return post.quote_post_count + post.repost_count;
    }, [postDetail, post]);

    return (
        <section className={cn("flex flex-col items-center relative", className)}>
            <ActionButton
                icon={
                    isLikedState ? (
                        isOpenAnimatingLike ? (
                            <LikedIcon className="absolute size-[1.5em]! " />
                        ) : (
                            <FaHeart className="size-[0.5em] text-red-500" />
                        )
                    ) : (
                        <FaHeart className="size-[0.5em]" />
                    )
                }
                count={postDetail?.likes_count ?? post.likes_count}
                label="Like"
                onClick={toggleLikeState}
            />

            <ActionButton
                icon={<AiFillMessage className="size-[0.5em]" />}
                count={postDetail?.comments_count ?? post.comments_count}
                label="Comment"
                onClick={handleOpenComment}
            />
            <ActionButton
                icon={
                    isBookmarkedState ? (
                        isOpenAnimatingBookmark ? (
                            <BookmarkIcon className=" absolute size-[0.8em]!" />
                        ) : (
                            <FaBookmark className="size-[0.5em] text-yellow-500" />
                        )
                    ) : (
                        <FaBookmark className="size-[0.5em] " />
                    )
                }
                count={postDetail?.bookmarks_count ?? post.bookmarks_count}
                label="Save"
                onClick={toggleBookmarkState}
            />

            <ActionButton
                icon={<FaShare className="size-[0.5em]" />}
                count={shares_count}
                label="Share"
                onClick={() => {}}
            />
        </section>
    );
}
