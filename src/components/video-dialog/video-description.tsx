"use client";

import LikedIcon from "@/components/lottie-icons/liked-icon";
import ShowMore from "@/components/show-more";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import envConfig from "@/config/app.config";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { TikTokPostType } from "@/types/schemas/TikTokPost.schemas";
import { formatCash } from "@/utils/formatting/formatNumber";
import { timeAgo } from "@/utils/formatting/formatTime";
import { useLocale } from "next-intl";
import { useCallback } from "react";
import { AiFillMessage } from "react-icons/ai";
import { FaBookmark, FaHeart } from "react-icons/fa6";
import { toast } from "sonner";

type VideoDescriptionProps = {
    post: TikTokPostType;
    className?: string;
};

export default function VideoDescription({ post, className }: VideoDescriptionProps) {
    const user = post.author;
    const locale = useLocale();
    const linkToVideo = `${envConfig.NEXT_PUBLIC_URL}@${user.username}/video/${post._id}`;
    const copyLink = useCallback(() => {
        navigator.clipboard.writeText(linkToVideo);
        toast.success("Link copied to clipboard", {
            position: "top-center",
        });
    }, [linkToVideo]);
    return (
        <div className={cn("p-4 border-b", className)}>
            <div className="mb-4 bg-muted rounded-lg p-4 ">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <Link href={`/@${user.username}`}>
                            <Avatar className="size-12">
                                <AvatarImage src={user.avatar} alt={user.username} />
                                <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                        </Link>
                        <div className="flex flex-col">
                            <Link href={`/@${user.username}`}>
                                <span className="font-semibold text-sm hover:underline">{user.username}</span>
                            </Link>
                            <span className="text-sm text-muted-foreground">
                                {user.username} • {timeAgo({ locale, date: post.created_at })}
                            </span>
                        </div>
                    </div>
                    <Button size="sm" className="primary-button px-8! text-base! font-medium! h-9!">
                        {user.is_followed ? "Following" : "Follow"}
                    </Button>
                </div>

                <ShowMore text={post.content} maxHeight={60} />
            </div>

            {/* Video Stats and Actions */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                        <Button
                            variant="secondary"
                            className={cn(
                                "text-5xl size-8 rounded-full flex items-center justify-center cursor-pointer ",
                                "transition-all duration-200",
                                " [&>svg]:size-5! "
                            )}
                            size="icon"
                        >
                            {post.is_liked ? <LikedIcon /> : <FaHeart />}
                        </Button>

                        <span className="text-sm font-semibold">{formatCash.format(post.likes_count)}</span>
                    </div>

                    <div className="flex items-center gap-1">
                        <Button
                            variant="secondary"
                            className={cn(
                                "text-5xl size-8 rounded-full flex items-center justify-center cursor-pointer ",
                                "transition-all duration-200",
                                " [&>svg]:size-5! "
                            )}
                            size="icon"
                        >
                            <AiFillMessage />
                        </Button>
                        <span className="text-sm font-semibold">{formatCash.format(post.comments_count)}</span>
                    </div>

                    <div className="flex items-center gap-1">
                        <Button
                            variant="secondary"
                            className={cn(
                                "text-5xl size-8 rounded-full flex items-center justify-center cursor-pointer ",
                                "transition-all duration-200",
                                " [&>svg]:size-5! "
                            )}
                            size="icon"
                        >
                            <FaBookmark />
                        </Button>
                        <span className="text-sm font-semibold">{formatCash.format(post.bookmarks_count)}</span>
                    </div>
                </div>
            </div>

            <div className=" bg-muted rounded-lg flex items-center justify-between border border-border">
                <span className="pl-2 text-sm text-muted-foreground truncate flex-1 mr-2">{linkToVideo}</span>
                <button
                    className="text-sm font-semibold shrink-0 py-2 px-4 cursor-pointer bg-card hover:bg-card/70 rounded-e-lg"
                    onClick={copyLink}
                >
                    Copy link
                </button>
            </div>
        </div>
    );
}
