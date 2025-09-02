"use client";

import React, { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Check, Plus } from "lucide-react";
import { FaBookmark, FaHeart, FaShare } from "react-icons/fa6";
import LikedIcon from "@/components/lottie-icons/liked-icon";
import BookmarkIcon from "@/components/lottie-icons/bookmark-icon";
import { TikTokPostType } from "@/types/schemas/TikTokPost.schemas";
import { AiFillMessage } from "react-icons/ai";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { closeModal, setOpenModal } from "@/store/features/modalSlide";
import { useGetUserByUsernameQuery } from "@/services/RTK/user.services";
import { useFollowUser } from "@/hooks/data/useUser";
import { AuthModal } from "@/components/auth-modal";
import { useBookmarkPost, useLikePost } from "@/hooks/data/useVideo";
import useCurrentUserData from "@/hooks/data/useCurrentUserData";
import ActionButton from "@/components/action-video-bar-v1/action-button";

interface ActionBarProps {
    post: TikTokPostType;
    className?: string;
}

export default function ActionBar({ post, className }: ActionBarProps) {
    const { author } = post;
    const currentUser = useCurrentUserData();
    const isCurrentUser = currentUser?._id === author._id;

    const { data: userData } = useGetUserByUsernameQuery(author.username);
    const fetchedAuthor = userData?.data;
    const openModalVideoDetailType = useAppSelector((state) => state.modal.typeOpenModal);
    const prevPathOpenModal = useAppSelector((state) => state.modal.prevPathnameOpenModal);
    const dispatch = useAppDispatch();
    const router = useRouter();

    const pathname = usePathname();

    const { isFollowedState, onToggleFollow } = useFollowUser({
        userId: fetchedAuthor?._id ?? author._id,
        initialFollowState: fetchedAuthor?.is_followed ?? author.is_followed,
    });

    const [isOpenAnimatingLike, setIsOpenAnimatingLike] = useState<boolean>(false);
    const { isLikedState, toggleLikeState } = useLikePost({
        postId: post._id,
        initialLikeState: post.is_liked,
        onLiked: () => {
            setIsOpenAnimatingLike(true);
            setTimeout(() => setIsOpenAnimatingLike(false), 3000);
        },
    });

    const [isOpenAnimatingBookmark, setIsOpenAnimatingBookmark] = useState<boolean>(false);
    const { isBookmarkedState, toggleBookmarkState } = useBookmarkPost({
        postId: post._id,
        initialBookmarkState: post.is_bookmarked,
        onBookmarked: () => {
            setIsOpenAnimatingBookmark(true);
            setTimeout(() => setIsOpenAnimatingBookmark(false), 3000);
        },
    });

    const handleToggleOpenComment = useCallback(() => {
        if (openModalVideoDetailType === "commentsVideoDetail") {
            dispatch(closeModal());
            if (prevPathOpenModal) {
                router.replace(prevPathOpenModal, { scroll: false });
            } else {
                router.replace("/");
            }
        } else {
            dispatch(setOpenModal({ prevPathname: pathname, type: "commentsVideoDetail" }));
        }
    }, [openModalVideoDetailType, dispatch, pathname, router, prevPathOpenModal]);

    return (
        <section className={cn("flex flex-col items-center gap-3  relative", className)}>
            {/* Avatar & Follow */}
            <div className="flex flex-col items-center text-5xl">
                <Link href={`/@${fetchedAuthor?.username ?? author.username}`}>
                    <Avatar className="w-[1em] h-[1em] shrink-0">
                        <AvatarImage
                            src={fetchedAuthor?.avatar ?? author.avatar}
                            alt={fetchedAuthor?.avatar ?? author.username}
                            className="shrink-0 object-cover"
                        />
                        <AvatarFallback className="text-sm font-medium">
                            {(fetchedAuthor?.name ?? author.name).substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                </Link>
                {!!currentUser ? (
                    !isCurrentUser && (
                        <Button
                            variant="secondary"
                            onClick={onToggleFollow}
                            className={cn(
                                "relative mt-[-0.7rem] w-6 h-6 flex items-center text-white justify-center rounded-full bg-brand hover:bg-brand/90",
                                "border border-brand/10 cursor-pointer",
                                isFollowedState && "text-brand bg-accent hover:bg-accent/90"
                            )}
                        >
                            {isFollowedState ? <Check className=" w-3 h-3" /> : <Plus className=" w-3 h-3" />}
                        </Button>
                    )
                ) : (
                    <AuthModal>
                        <Button
                            variant="secondary"
                            className={cn(
                                "relative mt-[-0.7rem] w-6 h-6 flex items-center text-white justify-center rounded-full bg-brand hover:bg-brand/90",
                                "border border-brand/10 cursor-pointer"
                            )}
                        >
                            <Plus className=" w-3 h-3" />
                        </Button>
                    </AuthModal>
                )}
            </div>
            {/* Action Buttons */}
            <div className="flex flex-col items-center gap-6">
                <ActionButton
                    icon={
                        isLikedState ? (
                            isOpenAnimatingLike ? (
                                <LikedIcon className="absolute size-[1.5em]! " />
                            ) : (
                                <FaHeart className="size-[0.5em] text-red-500  " />
                            )
                        ) : (
                            <FaHeart className="size-[0.5em]" />
                        )
                    }
                    count={post.likes_count}
                    label="Like"
                    onClick={toggleLikeState}
                    className={isLikedState ? "text-red-500" : ""}
                    isAuth={!!currentUser}
                    requiredAuth
                />

                <ActionButton
                    icon={<AiFillMessage className="size-[0.5em]" />}
                    count={post.comments_count}
                    label="Comment"
                    onClick={handleToggleOpenComment}
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
                            <FaBookmark className="size-[0.5em]" />
                        )
                    }
                    count={post.bookmarks_count}
                    label="Save"
                    onClick={toggleBookmarkState}
                    isAuth={!!currentUser}
                    requiredAuth
                />

                <ActionButton
                    icon={<FaShare className="size-[0.5em]" />}
                    count={post.quote_post_count + post.repost_count}
                    label="Share"
                    onClick={() => {}}
                />
            </div>
        </section>
    );
}
