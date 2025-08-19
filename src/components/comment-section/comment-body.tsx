"use client";

import { AuthModal } from "@/components/auth-modal";
import CommentForm from "@/components/comment-section/comment-form";
import { useRootCommentsContext } from "@/components/comment-section/comment-list";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useLikePost } from "@/hooks/data/useVideo";
import { useAppSelector } from "@/hooks/redux";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { CommentType } from "@/types/schemas/comment.schemas";
import { formatCash } from "@/utils/formatting/formatNumber";
import { timeAgo } from "@/utils/formatting/formatTime";
import { X } from "lucide-react";
import { useLocale } from "next-intl";
import { useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa6";

type CommentBodyProps = {
    comment: CommentType;
    parent_id: string;
};

function LikeButton({
    isAuth,
    isLiked,
    toggleLike,
    className,
    likesCount,
}: {
    isAuth: boolean;
    isLiked: boolean;
    toggleLike: () => void;
    className?: string;
    likesCount: number;
}) {
    const content = (
        <span className={cn("flex space-x-1 font-light")}>
            <button onClick={toggleLike} className="cursor-pointer">
                {isLiked ? <FaHeart size={17} className="text-red-500" /> : <FaRegHeart size={17} />}
            </button>
            <strong>{formatCash.format(likesCount)}</strong>
        </span>
    );
    return (
        <div className={className}>
            {isAuth ? (
                content
            ) : (
                <AuthModal>
                    <div className="relative">
                        <button className="absolute inset-0" />
                        {content}
                    </div>
                </AuthModal>
            )}
        </div>
    );
}

export function CommentBody({ comment, parent_id }: CommentBodyProps) {
    const { parent_id: root_id } = useRootCommentsContext();
    const [isOpenFormReply, setIsOpenFormReply] = useState<boolean>(false);
    const locale = useLocale();
    const { isLikedState, toggleLikeState } = useLikePost({
        postId: comment._id,
        initialLikeState: comment.is_liked,
    });

    const role = useAppSelector((state) => state.auth.role);
    return (
        <div className=" mb-2 space-y-4">
            <div className="flex  items-start gap-3">
                <Link href={`/@${comment.author.username}`}>
                    <Avatar className="size-10">
                        <AvatarImage src={comment.author.avatar} alt={comment.author.username} />
                        <AvatarFallback className="bg-gray-300 text-gray-700">
                            {comment.author.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                </Link>
                <div className="flex flex-col w-full">
                    <Link href={`/@${comment.author.username}`}>
                        <span className=" text-sm hover:underline ">{comment.author.username}</span>
                    </Link>
                    <span className="text-sm">{comment.content}</span>
                    <div className="text-sm text-muted-foreground font-semibold flex items-center gap-6">
                        <span>{timeAgo({ locale, date: comment.created_at })}</span>
                        <span
                            className="cursor-pointer"
                            role="button"
                            aria-label="Reply to this comment"
                            onClick={() => setIsOpenFormReply((prev) => !prev)}
                        >
                            Reply
                        </span>
                        <LikeButton
                            isAuth={role !== null}
                            isLiked={isLikedState}
                            toggleLike={toggleLikeState}
                            likesCount={comment.likes_count}
                            className="ml-auto pr-2"
                        />
                    </div>
                </div>
            </div>
            {isOpenFormReply && (
                <div className="ml-10 flex gap-3 mb-3">
                    <CommentForm
                        postId={root_id}
                        placeholder="Add a reply..."
                        onClose={() => setIsOpenFormReply(false)}
                        parentId={parent_id}
                    />
                    <Button variant="ghost" size="icon" aria-label="Close" onClick={() => setIsOpenFormReply(false)}>
                        <X />
                    </Button>
                </div>
            )}
        </div>
    );
}
