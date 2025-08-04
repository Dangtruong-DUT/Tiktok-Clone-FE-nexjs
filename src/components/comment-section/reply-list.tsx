"use client";

import ReplyItem from "@/app/[locale]/(public)/(home)/@videoComments/(.)[username]/video/[id]/comment-section/reply-Item";
import { CommentType } from "@/types/schemas/comment.schemas";
import { useState } from "react";

interface ReplyItemProps {
    parentId: string;
}

export default function ReplyList({ parentId }: ReplyItemProps) {
    const [page, setPage] = useState(1);
    const [replies, setReplies] = useState<CommentType[]>([]);
    const [hasMore, setHasMore] = useState(true);

    return (
        <div>
            {replies.map((reply) => (
                <ReplyItem key={reply.id} reply={reply} />
            ))}
            {hasMore && (
                <button onClick={() => setPage((p) => p + 1)} className="text-sm text-gray-400 mt-1">
                    View more replies
                </button>
            )}
        </div>
    );
}
