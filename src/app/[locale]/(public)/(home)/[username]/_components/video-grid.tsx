"use client";

import CardVideoItem from "@/components/card-video-item";
import { Link } from "@/i18n/navigation";
import { useAppContext } from "@/provider/app-provider";
import { TikTokPostType } from "@/types/schemas/TikTokPost.schemas";
import { UserType } from "@/types/schemas/User.schema";
import { useCallback } from "react";

interface VideoGridProps {
    videos: {
        post: TikTokPostType;
        user: UserType;
    }[];
}

function VideoGrid({ videos }: VideoGridProps) {
    const { setOpenModalVideoDetailType } = useAppContext();

    const handleVideoClick = useCallback(() => {
        setOpenModalVideoDetailType("modalVideoDetail");
    }, [setOpenModalVideoDetailType]);

    return (
        <div className="mt-6 w-full">
            <div className="grid gap-6 gap-x-4 grid-cols-[repeat(auto-fill,minmax(240px,1fr))] w-full  md:grid-cols-[repeat(auto-fill,minmax(180px,1fr))]">
                {videos.map((video, index) => {
                    const videoLink = `/@${video.user.username}/video/${video.post._id}`;
                    return (
                        <Link key={index} href={videoLink} className="w-full" onClick={handleVideoClick}>
                            <CardVideoItem post={video.post} author={video.user} isDescriptionVisible={false} />
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

export default VideoGrid;
