"use client";

import LoadingIcon from "@/components/lottie-icons/loading";
import { useCallback, useEffect, useRef } from "react";
import { useInViewport } from "@/hooks/ui/useInViewport";
import CardVideoItem from "@/components/card-video-item";
import { TikTokPostType } from "@/types/schemas/TikTokPost.schemas";
import { Link, usePathname } from "@/i18n/navigation";
import { useAppDispatch } from "@/hooks/redux";
import { setOpenModal } from "@/store/features/modalSlide";

interface PostsContainerProps {
    fetchNextPage: () => void;
    hasNextPage: boolean;
    data: TikTokPostType[];
    isFetching: boolean;
}

export default function PostsContainer({ fetchNextPage, hasNextPage, data, isFetching }: PostsContainerProps) {
    const sentinelForPostsResultScrollRef = useRef<HTMLDivElement>(null);
    const isInViewport = useInViewport(sentinelForPostsResultScrollRef);
    const dispatch = useAppDispatch();
    const pathname = usePathname();

    const handleVideoClick = useCallback(() => {
        dispatch(setOpenModal({ prevPathname: pathname, type: "modalVideoDetail" }));
    }, [dispatch, pathname]);

    useEffect(() => {
        if (hasNextPage && isInViewport) {
            fetchNextPage();
        }
    }, [hasNextPage, isInViewport, fetchNextPage]);

    return (
        <div>
            <div className="mx-auto p-4 max-w-184  overflow-y-auto   scrollbar-hidden grid  gap-6 grid-cols-[repeat(auto-fill,minmax(240px,1fr))]  md:grid-cols-[repeat(auto-fill,minmax(180px,1fr))]  w-full">
                {data.map((post) => (
                    <Link
                        key={post._id}
                        href={`/@${post.author.username}/video/${post._id}`}
                        className="w-full"
                        onClick={handleVideoClick}
                    >
                        <CardVideoItem post={post} />
                    </Link>
                ))}
                {isFetching && (
                    <div className="px-4 py-4  col-span-full">
                        <LoadingIcon className="size-15 mx-auto" loop />
                    </div>
                )}
            </div>

            {/* Sentinel để lắng nghe*/}
            <div className="h-px bg-transparent" ref={sentinelForPostsResultScrollRef} />
        </div>
    );
}
