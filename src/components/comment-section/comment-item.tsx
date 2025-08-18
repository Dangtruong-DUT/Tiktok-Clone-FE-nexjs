"use client";

import { CommentBody } from "@/components/comment-section/comment-body";
import ReplyList from "@/components/comment-section/reply-list";
import { CommentType } from "@/types/schemas/comment.schemas";
import { formatCash } from "@/utils/formatting/formatNumber";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface ReplyListProps {
    comment: CommentType;
}

export default function CommentItem({ comment }: ReplyListProps) {
    const [showReplies, setShowReplies] = useState<boolean>(false);
    console.log(comment);
    return (
        <div className="py-2 mb-1">
            <CommentBody comment={comment} parent_id={comment._id} />
            {comment.comments_count > 0 && (
                <div className="flex items-center gap-2 mt-1 ms-10">
                    <div className="w-8 h-px bg-muted-foreground" />
                    <button
                        onClick={() => setShowReplies((p) => !p)}
                        className="text-sm text-muted-foreground font-semibold cursor-pointer"
                    >
                        {showReplies
                            ? "Hide"
                            : `View ${formatCash.format(comment.comments_count)} ${
                                  comment.comments_count > 1 ? "replies" : "reply"
                              }`}
                    </button>
                    <ChevronDown className="text-muted-foreground size-3 font-semibold" />
                </div>
            )}

            {showReplies && (
                <div className="ml-10 mt-2">
                    <ReplyList parentId={comment._id} />
                </div>
            )}
        </div>
    );
}
