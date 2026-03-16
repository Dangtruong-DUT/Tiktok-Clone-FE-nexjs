"use client";

import { CommentBody } from "@/components/comment-section/comment-body";
import { useGetCommentsInfiniteQuery } from "@/services/RTK/posts.services";
import { GetListCommentRes } from "@/types/response/post.type";
import { CommentType } from "@/types/schemas/comment.schemas";
import {
    BaseQueryFn,
    FetchArgs,
    FetchBaseQueryError,
    InfiniteQueryActionCreatorResult,
    InfiniteQueryDefinition,
} from "@reduxjs/toolkit/query";
import { createContext } from "react";
import LoadingIcon from "@/components/lottie-icons/loading";

interface ReplyCommentsContextProps {
    parent_id: string;
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
const ReplyCommentsContext = createContext<ReplyCommentsContextProps | undefined>(undefined);

interface ReplyItemProps {
    parentId: string;
}

export default function ReplyList({ parentId }: ReplyItemProps) {
    const { data, fetchNextPage, hasNextPage, isFetching } = useGetCommentsInfiniteQuery(parentId);
    const comments: CommentType[] = data?.pages.flatMap((page) => page.data.posts) || [];
    return (
        <ReplyCommentsContext
            value={{
                parent_id: parentId,
                hashNextPage: hasNextPage,
                fetchNextPage,
            }}
        >
            <div>
                {comments.map((reply) => (
                    <CommentBody key={reply._id} comment={reply} parent_id={parentId} />
                ))}
                {isFetching && (
                    <div>
                        <LoadingIcon className="size-10 mx-auto" loop />
                    </div>
                )}
                {hasNextPage && (
                    <button
                        onClick={fetchNextPage}
                        className="text-muted-foreground font-semibold text-sm mt-1 flex cursor-pointer"
                    >
                        View more
                    </button>
                )}
            </div>
        </ReplyCommentsContext>
    );
}
