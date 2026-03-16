"use client";

import CommentItem from "@/components/comment-section/comment-item";
import { useGetCommentsInfiniteQuery } from "@/services/RTK/posts.services";
import { GetListCommentRes } from "@/types/response/post.type";
import { CommentType } from "@/types/schemas/comment.schemas";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { BaseQueryFn, FetchArgs, InfiniteQueryDefinition } from "@reduxjs/toolkit/query";
import { InfiniteQueryActionCreatorResult } from "@reduxjs/toolkit/query";
import { createContext, useContext, useEffect, useRef } from "react";
import { useInViewport } from "@/hooks/ui/useInViewport";
import AccountItemSkeleton from "@/components/comment-section/account-item-skeleton";

interface RootCommentsContextProps {
    parent_id: string;
    username: string;
    hashNextPage: boolean;
    fetchNextPage: () => InfiniteQueryActionCreatorResult<
        InfiniteQueryDefinition<
            string,
            number,
            BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>,
            "Posts",
            GetListCommentRes,
            "postApi",
            unknown
        >
    >;
}
const RootCommentsContext = createContext<RootCommentsContextProps | undefined>(undefined);

type CommentListProps = { postId: string; username: string };
export default function CommentList({ postId, username }: CommentListProps) {
    const { data, fetchNextPage, hasNextPage, isLoading } = useGetCommentsInfiniteQuery(postId, {
        pollingInterval: 10000,
    });
    const comments: CommentType[] = data?.pages.flatMap((page) => page.data.posts) || [];

    const sentinelScrollRef = useRef<HTMLDivElement | null>(null);
    const isSentinelInView = useInViewport(sentinelScrollRef);

    useEffect(() => {
        if (isSentinelInView && hasNextPage) {
            fetchNextPage();
        }
    }, [isSentinelInView, hasNextPage, fetchNextPage]);

    return (
        <RootCommentsContext
            value={{
                parent_id: postId,
                hashNextPage: hasNextPage,
                fetchNextPage,
                username: username,
            }}
        >
            <div className=" pt-6 overflow-y-auto scrollbar-hidden max-h-full">
                {comments.length > 0 &&
                    !isLoading &&
                    comments.map((comment) => <CommentItem key={comment._id} comment={comment} />)}

                {comments.length === 0 && !isLoading && (
                    <p className="text-gray-500 text-center">Be the first to comment!</p>
                )}
                {/* Sentinel để lắng nghe*/}
                <div className="h-px bg-transparent" ref={sentinelScrollRef} />
                {isLoading && (
                    <div className="space-y-4  ">
                        {Array.from({ length: 20 }).map((_, index) => (
                            <AccountItemSkeleton key={index} />
                        ))}
                    </div>
                )}
            </div>
        </RootCommentsContext>
    );
}

export function useRootCommentsContext() {
    const context = useContext(RootCommentsContext);
    if (!context) {
        throw new Error("useRootCommentsContext must be used within a RootCommentsProvider");
    }
    return context;
}
