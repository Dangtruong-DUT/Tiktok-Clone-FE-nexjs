"use client";

import CommentForm from "@/components/comment-section/comment-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CommentType } from "@/types/schemas/comment.schemas";
import { timeAgo } from "@/utils/formatting/formatTime";
import { X } from "lucide-react";
import { useLocale } from "next-intl";
import { useState } from "react";

type CommentBodyProps = {
    comment: CommentType;
};

export function CommentBody({ comment }: CommentBodyProps) {
    const [isOpenFormReply, setIsOpenFormReply] = useState<boolean>(false);
    const locale = useLocale();

    return (
        <div className=" mb-2 space-y-4">
            <div className="flex  items-start gap-3">
                <Avatar className="w-10 h-10">
                    <AvatarImage src={comment.user.avatar} alt={comment.user.username} />
                    <AvatarFallback className="bg-gray-300 text-gray-700">
                        {comment.user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <div className=" text-sm">{comment.user.username}</div>
                    <div>{comment.content}</div>
                    <div className="text-sm text-muted-foreground font-semibold flex items-center gap-6">
                        <span>{timeAgo({ locale, date: comment.createdAt })}</span>
                        <span
                            className="cursor-pointer"
                            role="button"
                            aria-label="Reply to this comment"
                            onClick={() => setIsOpenFormReply((prev) => !prev)}
                        >
                            Reply
                        </span>
                    </div>
                </div>
            </div>
            {isOpenFormReply && (
                <div className="ml-10 flex gap-3 mb-3">
                    <CommentForm postId={comment.id} placeholder="Add a reply..." />
                    <Button variant="ghost" size="icon" aria-label="Close" onClick={() => setIsOpenFormReply(false)}>
                        <X />
                    </Button>
                </div>
            )}
        </div>
    );
}
