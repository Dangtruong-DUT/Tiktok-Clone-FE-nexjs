"use client";

import React, { startTransition, useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Check, Plus } from "lucide-react";
import { FaBookmark, FaHeart, FaShare } from "react-icons/fa6";
import LikedIcon from "@/components/lottie-icons/liked-icon";
import BookmarkIcon from "@/components/lottie-icons/bookmark-icon";
import { formatCash } from "@/utils/formatting/formatNumber";
import { TikTokPostType } from "@/types/schemas/TikTokPost.schemas";
import { UserType } from "@/types/schemas/User.schema";
import { AiFillMessage } from "react-icons/ai";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { usePathname, useRouter } from "@/i18n/navigation";
import { closeModal, setOpenModal } from "@/store/features/modalSlide";

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
        <div className="flex flex-col items-center gap-2">
            <Button
                variant="secondary"
                onClick={onClick}
                className={cn(
                    "text-5xl size-[1em] rounded-full flex items-center justify-center cursor-pointer ",
                    "transition-all duration-200",
                    className
                )}
                size="icon"
            >
                {icon}
            </Button>
            <span className=" text-xs font-bold text-center">{count ? formatCash.format(count) : label}</span>
        </div>
    );
}

export default function ActionBar({ post, author, className }: ActionBarProps) {
    const openModalVideoDetailType = useAppSelector((state) => state.modal.typeOpenModal);
    const prevPathOpenModal = useAppSelector((state) => state.modal.prevPathnameOpenModal);
    const dispatch = useAppDispatch();
    const router = useRouter();

    const pathname = usePathname();
    const [liked, setLiked] = useState(post.is_liked);
    const [saved, setSaved] = useState(post.is_bookmarked);
    const [following, setFollowing] = useState(false);

    const toggle = (setter: React.Dispatch<React.SetStateAction<boolean>>) =>
        startTransition(() => setter((prev) => !prev));

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
                <Avatar className="w-[1em] h-[1em]">
                    <AvatarImage src={author.avatar} alt={author.username} />
                    <AvatarFallback className="text-sm font-medium">
                        {author.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>

                <Button
                    variant="secondary"
                    onClick={() => toggle(setFollowing)}
                    className={cn(
                        "relative mt-[-0.5rem] text-5xl  size-[0.5em] text-white/90 rounded-full bg-brand border-2",
                        "transition-all duration-200 hover:bg-brand/90",
                        following && "text-brand bg-accent hover:bg-accent/90"
                    )}
                >
                    {following ? (
                        <Check className="size-4 absolute m-auto" />
                    ) : (
                        <Plus className="size-4 absolute m-auto" />
                    )}
                </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col items-center gap-6">
                <ActionButton
                    icon={
                        liked ? <LikedIcon className="absolute size-[1.5em]! " /> : <FaHeart className="size-[0.5em]" />
                    }
                    count={post.likes_count}
                    label="Like"
                    onClick={() => toggle(setLiked)}
                    className={liked ? "text-red-500" : ""}
                />

                <ActionButton
                    icon={<AiFillMessage className="size-[0.5em]" />}
                    count={post.comment_count}
                    label="Comment"
                    onClick={handleToggleOpenComment}
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
            </div>
        </section>
    );
}
