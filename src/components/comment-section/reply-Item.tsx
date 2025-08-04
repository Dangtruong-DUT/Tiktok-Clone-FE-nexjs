"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CommentType } from "@/types/schemas/comment.schemas";
import { timeAgo } from "@/utils/formatting/formatTime";
import { useLocale } from "next-intl";

interface ReplyItemProps {
    reply: CommentType;
}

export default function ReplyItem({ reply }: ReplyItemProps) {
    const locale = useLocale();
    return (
        <div className="flex items-start gap-2 mb-2">
            <Avatar className="w-7 h-7">
                <AvatarImage src={reply.user.avatar} alt={reply.user.username} />
                <AvatarFallback className="bg-gray-300 text-gray-700">
                    {reply.user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
            </Avatar>
            <div>
                <div className="font-semibold">{reply.user.username}</div>
                <div>{reply.content}</div>
                <div className="text-xs text-gray-500 flex gap-4">
                    <span>{timeAgo({ locale, date: reply.createdAt })}</span>
                    <span>Reply</span>
                </div>
            </div>
        </div>
    );
}
