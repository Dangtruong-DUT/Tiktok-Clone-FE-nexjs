"use client";

import CommentItem from "@/components/comment-section/comment-item";
import { fetchCommentsByPostId } from "@/mock/mockCommentApi";
import { CommentType } from "@/types/schemas/comment.schemas";
import { useEffect, useState } from "react";

type CommentListProps = { postId: string };

export default function CommentList({ postId }: CommentListProps) {
    const [page, setPage] = useState<number>(1);
    const [comments, setComments] = useState<CommentType[]>([]);

    useEffect(() => {
        if (!postId) return;
        fetchCommentsByPostId(postId.toString(), page).then((data) => {
            setComments((prev) => [...prev, ...data.comments]);
        });
    }, [postId, page]);

    return (
        <div className="pt-6">
            {comments.length > 0 ? (
                comments.map((comment) => <CommentItem key={comment.id} comment={comment} />)
            ) : (
                <p className="text-gray-500 text-center">Be the first to comment!</p>
            )}
        </div>
    );
}
