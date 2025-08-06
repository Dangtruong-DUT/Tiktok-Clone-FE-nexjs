"use client";

import CardVideoItem from "@/components/card-video-item";
import { VideoPlaylistItem, useVideoPlaylist } from "@/provider/video-playlist-provider";
import { useVideoRouterNavigation } from "@/hooks/video/useVideoRouterNavigation";

type SuggestedVideosProps = {
    postList: VideoPlaylistItem[];
};

export default function SuggestedVideos({ postList }: SuggestedVideosProps) {
    const { currentIndex } = useVideoPlaylist();
    const { navigateToVideoById } = useVideoRouterNavigation();

    const handleVideoClick = (videoId: string) => {
        navigateToVideoById(videoId);
    };

    return (
        <section className="w-full p-4">
            <h4 className="text-lg font-semibold">You may like</h4>
            <div className="grid grid-cols-2 gap-4 mt-4">
                {postList.map(({ post, user }, index) => (
                    <div key={post._id} className="relative cursor-pointer" onClick={() => handleVideoClick(post._id)}>
                        <CardVideoItem post={post} author={user} isCurrentlyPlaying={index === currentIndex} />
                    </div>
                ))}
            </div>
        </section>
    );
}
