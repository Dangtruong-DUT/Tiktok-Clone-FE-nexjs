"use client";

import VideoDetailDialog from "@/components/post-detail-modal";
import useCurrentUserData from "@/hooks/data/useCurrentUserData";
import { useRouter } from "@/i18n/navigation";
import { useGetPostOfUserPagingQuery } from "@/services/RTK/posts.services";
import { formatCash } from "@/utils/formatting/formatNumber";
import { formatISOToDisplayDate } from "@/utils/formatting/formatTime";
import Image from "next/image";
import { useState } from "react";
import { BsFillImageFill } from "react-icons/bs";
import { FaChevronRight, FaCommentDots, FaHeart, FaPlay } from "react-icons/fa6";

interface RecentPostProps {
    classNames?: string;
}
export default function RecentPosts({ classNames }: RecentPostProps) {
    const [isModalDetailOpen, setIsModalDetailOpen] = useState(false);
    const router = useRouter();
    const currentUser = useCurrentUserData();
    const { data } = useGetPostOfUserPagingQuery(
        {
            userId: currentUser?._id || "",
            page: 1,
        },
        {
            skip: !currentUser?._id,
        }
    );

    const posts = data?.data.posts || [];

    const handleRecentPostClick = () => {
        router.push(`/tiktokstudio/content`);
    };

    return (
        <div className={classNames}>
            <div className="text-base font-bold flex justify-between items-center">
                <span className="flex items-center gap-2 cursor-pointer" onClick={handleRecentPostClick}>
                    Recent posts <FaChevronRight />
                </span>
            </div>
            <div className="bg-card border rounded-lg border-border px-4 mt-4">
                <ul className="divide-y ">
                    {posts.slice(0, 4).map((post) => (
                        <li key={post._id} className="py-4 flex justify-between items-center">
                            <div className="flex gap-4 items-center">
                                {post.thumbnail_url && (
                                    <Image
                                        src={post.thumbnail_url}
                                        width={60}
                                        height={80}
                                        alt=""
                                        className="object-cover w-[60px] h-[80px] rounded-md"
                                    />
                                )}
                                {!post.thumbnail_url && (
                                    <div className="w-[60px] h-[80px] flex items-center justify-center bg-card rounded-md border">
                                        <BsFillImageFill />
                                    </div>
                                )}
                                <div className="flex flex-col gap-[7px]">
                                    <span
                                        className="truncate font-medium text-sm inline-block max-w-[100px] hover:underline cursor-pointer"
                                        onClick={() => setIsModalDetailOpen(true)}
                                    >
                                        {post.content}
                                    </span>

                                    <span className="text-muted-foreground text-xs">
                                        {formatISOToDisplayDate(post.created_at)}
                                    </span>
                                </div>
                                <VideoDetailDialog
                                    isVisible={isModalDetailOpen}
                                    handleClose={() => setIsModalDetailOpen(false)}
                                    post={post}
                                />
                            </div>
                            <div className="flex gap-4 text-xs text-secondary-foreground">
                                <div className="flex  flex-col items-center gap-1 w-[72px] h-[48px]">
                                    <FaPlay size={16} />

                                    <span>{formatCash.format(post.user_views + post.guest_views || 0)}</span>
                                </div>
                                <div className="flex flex-col items-center gap-1  w-[72px] h-[48px]">
                                    <FaHeart size={16} />
                                    <span>{formatCash.format(post.likes_count || 0)}</span>
                                </div>
                                <div className="flex  flex-col items-center gap-1  w-[72px] h-[48px]">
                                    <FaCommentDots size={16} />
                                    <span>{formatCash.format(post.comments_count || 0)}</span>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
