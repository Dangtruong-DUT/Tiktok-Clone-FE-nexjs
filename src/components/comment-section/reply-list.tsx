"use client";

import { CommentBody } from "@/components/comment-section/comment-body";
import { fetchRepliesByCommentId } from "@/mock/mockCommentApi";
import { CommentType } from "@/types/schemas/comment.schemas";
import { useEffect, useState } from "react";

interface ReplyItemProps {
    parentId: string;
}

export default function ReplyList({ parentId }: ReplyItemProps) {
    const [page, setPage] = useState<number>(1);
    const [replies, setReplies] = useState<CommentType[]>([]);
    const [hasMore, setHasMore] = useState(true);
    useEffect(() => {
        fetchRepliesByCommentId(parentId, page).then((data) => {
            setReplies((prev) => [...prev, ...data.replies]);
            setHasMore(data.hasMore);
        });
    }, [parentId, page]);

    return (
        <div>
            {replies.map((reply) => (
                <CommentBody key={reply.id} comment={reply} />
            ))}
            {hasMore && (
                <button
                    onClick={() => setPage((p) => p + 1)}
                    className="text-muted-foreground font-semibold text-sm mt-1 flex custor-pointer"
                >
                    View more
                </button>
            )}
        </div>
    );
}
