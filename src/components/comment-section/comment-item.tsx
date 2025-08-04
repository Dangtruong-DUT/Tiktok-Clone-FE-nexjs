"use client";

import ReplyList from "@/app/[locale]/(public)/(home)/@videoComments/(.)[username]/video/[id]/comment-section/reply-list";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CommentType } from "@/types/schemas/comment.schemas";
import { formatCash } from "@/utils/formatting/formatNumber";
import { timeAgo } from "@/utils/formatting/formatTime";
import { useLocale } from "next-intl";
import { useState } from "react";

interface ReplyListProps {
    comment: CommentType;
}

export default function CommentItem({ comment }: ReplyListProps) {
    const [showReplies, setShowReplies] = useState(false);
    const locale = useLocale();
    return (
        <div className="py-2">
            <div className="flex items-start gap-2">
                <Avatar className="w-7 h-7">
                    <AvatarImage src={comment.user.avatar} alt={comment.user.username} />
                    <AvatarFallback className="bg-gray-300 text-gray-700">
                        {comment.user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <div className="font-semibold">{comment.user.name}</div>
                    <div>{comment.content}</div>
                    <div className="text-sm text-gray-500 flex items-center gap-4">
                        <span>{timeAgo({ locale, date: comment.createdAt })}</span>
                        <span>Reply</span>
                    </div>
                    {comment.reply_count > 0 && (
                        <button onClick={() => setShowReplies((p) => !p)} className="text-sm text-gray-400 mt-1">
                            {showReplies
                                ? "Hide"
                                : `View ${formatCash.format(comment.reply_count)} ${
                                      comment.reply_count > 1 ? "replies" : "reply"
                                  }`}
                        </button>
                    )}
                </div>
            </div>

            {showReplies && (
                <div className="ml-10 mt-2">
                    <ReplyList parentId={comment.id} />
                </div>
            )}
        </div>
    );
}
