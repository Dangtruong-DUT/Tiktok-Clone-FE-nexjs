"use client";

import useCurrentUserData from "@/hooks/data/useCurrentUserData";
import { useRouter } from "@/i18n/navigation";
import { useGetPostOfUserPagingQuery } from "@/services/RTK/posts.services";
import { TikTokPostType } from "@/types/schemas/TikTokPost.schemas";
import { formatCash } from "@/utils/formatting/formatNumber";
import { formatISOToDisplayDate } from "@/utils/formatting/formatTime";
import Image from "next/image";
import { useState } from "react";
import { BsFillImageFill } from "react-icons/bs";
import { FaChevronRight, FaCommentDots, FaHeart, FaPlay } from "react-icons/fa6";
import { useTranslations } from "next-intl";
import VideoDetailDialog from "@/components/video-dialog";

interface RecentPostProps {
    classNames?: string;
}
export default function RecentPosts({ classNames }: RecentPostProps) {
    const router = useRouter();
    const t = useTranslations("TiktokStudio.dashboard.recentPosts");
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
                    {t("title")} <FaChevronRight />
                </span>
            </div>
            <div className="bg-card border rounded-lg border-border  mt-4">
                <ul className="divide-y ">
                    {posts.slice(0, 4).map((post) => (
                        <li key={post._id}>
                            <VideoItem post={post} />
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

function VideoItem({ post }: { post: TikTokPostType }) {
    const t = useTranslations("TiktokStudio.dashboard.recentPosts");
    const [isModalDetailOpen, setIsModalDetailOpen] = useState(false);

    return (
        <>
            <div
                className="flex justify-between items-center cursor-pointer hover:bg-muted/50 p-4"
                onClick={() => setIsModalDetailOpen(true)}
            >
                <div className="flex gap-4 items-center">
                    {post.thumbnail_url ? (
                        <Image
                            src={post.thumbnail_url}
                            width={60}
                            height={80}
                            alt=""
                            className="object-cover w-[60px] h-[80px] rounded-md"
                        />
                    ) : (
                        <div className="w-[60px] h-[80px] flex items-center justify-center bg-card rounded-md border">
                            <BsFillImageFill />
                        </div>
                    )}
                    <div className="flex flex-col gap-[7px]">
                        <span className="truncate font-medium text-sm inline-block max-w-[100px]">{post.content}</span>
                        <span className="text-muted-foreground text-xs">
                            {t("createdAt", { date: formatISOToDisplayDate(post.created_at) })}
                        </span>
                    </div>
                </div>
                <div className="flex gap-4 text-xs text-secondary-foreground">
                    <div className="flex flex-col items-center gap-2 w-[72px] h-[48px]">
                        <FaPlay size={16} />
                        <span>{formatCash.format(post.user_views + post.guest_views || 0)}</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 w-[72px] h-[48px]">
                        <FaHeart size={16} />
                        <span>{formatCash.format(post.likes_count || 0)}</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 w-[72px] h-[48px]">
                        <FaCommentDots size={16} />
                        <span>{formatCash.format(post.comments_count || 0)}</span>
                    </div>
                </div>
            </div>
            <VideoDetailDialog
                isVisible={isModalDetailOpen}
                handleClose={() => setIsModalDetailOpen(false)}
                post={post}
            />
        </>
    );
}
