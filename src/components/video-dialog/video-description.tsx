"use client";

import { AuthModal } from "@/components/auth-modal";
import LikedIcon from "@/components/lottie-icons/liked-icon";
import ShowMore from "@/components/show-more";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import envConfig from "@/config/app.config";
import useCurrentUserData from "@/hooks/data/useCurrentUserData";
import { useFollowUser } from "@/hooks/data/useUser";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useGetUserByUsernameQuery } from "@/services/RTK/user.services";
import { TikTokPostType } from "@/types/schemas/TikTokPost.schemas";
import { formatCash } from "@/utils/formatting/formatNumber";
import { timeAgo } from "@/utils/formatting/formatTime";
import { useLocale } from "next-intl";
import { useCallback, useState } from "react";
import { AiFillMessage } from "react-icons/ai";
import { FaBookmark, FaHeart } from "react-icons/fa6";
import { toast } from "sonner";
import { useAppSelector } from "@/hooks/redux";
import { useBookmarkPost, useLikePost } from "@/hooks/data/useVideo";
import { useGetPostDetailQuery } from "@/services/RTK/posts.services";
import BookmarkIcon from "@/components/lottie-icons/bookmark-icon";
import ActionButton from "@/components/video-dialog/action-button";

type VideoDescriptionProps = {
    post: TikTokPostType;
    className?: string;
};

function FollowButton({
    isFollowedState,
    onToggleFollow,
    isAuth,
}: {
    isFollowedState: boolean;
    onToggleFollow: () => void;
    isAuth: boolean;
}) {
    const content = (
        <Button
            variant={isFollowedState ? "outline" : "default"}
            className={cn(" h-9!  rounded-xs! font-semibold! cursor-pointer text-base!", {
                "primary-button": !isFollowedState,
            })}
            onClick={onToggleFollow}
        >
            {isFollowedState ? "Following" : "Follow"}
        </Button>
    );
    return isAuth ? (
        content
    ) : (
        <AuthModal>
            <div className="relative">
                <button className="absolute inset-0" />
                {content}
            </div>
        </AuthModal>
    );
}

export default function VideoDescription({ post, className }: VideoDescriptionProps) {
    const user = post.author;
    const currentUser = useCurrentUserData();
    const isCurrentUser = currentUser?._id === user._id;
    const { data: userProfileRes } = useGetUserByUsernameQuery(user.username, { skip: isCurrentUser });
    const { isFollowedState, onToggleFollow } = useFollowUser({
        userId: user._id,
        initialFollowState: userProfileRes?.data.is_followed ?? false,
    });
    const locale = useLocale();
    const linkToVideo = `${envConfig.NEXT_PUBLIC_URL}@${user.username}/video/${post._id}`;

    const role = useAppSelector((state) => state.auth.role);
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
    const copyLink = useCallback(() => {
        navigator.clipboard.writeText(linkToVideo);
        toast.success("Link copied to clipboard", {
            position: "top-center",
        });
    }, [linkToVideo]);
    return (
        <div className={cn("p-4 border-b", className)}>
            <div className="mb-4 bg-muted rounded-lg p-4 ">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <Link href={`/@${user.username}`}>
                            <Avatar className="size-12">
                                <AvatarImage src={user.avatar} alt={user.username} />
                                <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                        </Link>
                        <div className="flex flex-col">
                            <Link href={`/@${user.username}`}>
                                <span className="font-semibold text-sm hover:underline">{user.username}</span>
                            </Link>
                            <span className="text-sm text-muted-foreground">
                                {user.username} • {timeAgo({ locale, date: post.created_at })}
                            </span>
                        </div>
                    </div>
                    <FollowButton
                        isFollowedState={isFollowedState}
                        onToggleFollow={onToggleFollow}
                        isAuth={!!currentUser}
                    />
                </div>

                <ShowMore text={post.content} maxHeight={60} />
            </div>

            {/* Video Stats and Actions */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <ActionButton
                        icon={
                            isLikedState ? (
                                isOpenAnimatingLike ? (
                                    <LikedIcon className="absolute size-[1.5em]!" />
                                ) : (
                                    <FaHeart className="size-[0.5em] text-red-500" />
                                )
                            ) : (
                                <FaHeart className="size-[0.5em]" />
                            )
                        }
                        onClick={toggleLikeState}
                        count={postDetail?.likes_count ?? post.likes_count}
                        label="Like"
                        isAuth={role != null}
                        requiredAuth
                    />

                    <div className="flex items-center gap-1">
                        <Button
                            variant="secondary"
                            className={cn(
                                "text-5xl size-8 rounded-full flex items-center justify-center cursor-pointer ",
                                "transition-all duration-200",
                                " [&>svg]:size-5! "
                            )}
                            size="icon"
                            onClick={() => {
                                const commentSection = document.getElementById(`comment-section-${post._id}`);
                                if (commentSection) {
                                    commentSection.scrollIntoView({ behavior: "smooth" });
                                }
                            }}
                        >
                            <AiFillMessage className="size-[0.5em]" />
                        </Button>
                        <span className="text-sm font-semibold">
                            {formatCash.format(postDetail?.comments_count ?? post.comments_count)}
                        </span>
                    </div>

                    <ActionButton
                        icon={
                            isBookmarkedState ? (
                                isOpenAnimatingBookmark ? (
                                    <BookmarkIcon className="absolute size-[0.6em]!" />
                                ) : (
                                    <FaBookmark className="size-[0.3em] text-yellow-500" />
                                )
                            ) : (
                                <FaBookmark className="size-[0.3em]" />
                            )
                        }
                        count={postDetail?.bookmarks_count ?? post.bookmarks_count}
                        isAuth={role != null}
                        requiredAuth
                        label="Bookmark"
                        onClick={toggleBookmarkState}
                    />
                </div>
            </div>

            <div className=" bg-muted rounded-lg flex items-center justify-between border border-border">
                <span className="pl-2 text-sm text-muted-foreground truncate flex-1 mr-2">{linkToVideo}</span>
                <button
                    className="text-sm font-semibold shrink-0 py-2 px-4 cursor-pointer bg-card hover:bg-card/70 rounded-e-lg"
                    onClick={copyLink}
                >
                    Copy link
                </button>
            </div>
        </div>
    );
}
