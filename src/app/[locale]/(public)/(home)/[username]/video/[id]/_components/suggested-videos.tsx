"use client";

import { useVideoPlaylist } from "@/app/[locale]/(public)/(home)/[username]/video/[id]/_context/video-playlist-context";
import { useVideoRouterNavigation } from "@/app/[locale]/(public)/(home)/[username]/video/[id]/_hook/useVideoRouterNavigation";
import CardVideoItem from "@/components/card-video-item";

export default function SuggestedVideos() {
    const { currentIndex, playlist } = useVideoPlaylist();
    const { navigateToVideoById } = useVideoRouterNavigation();

    const handleVideoClick = (videoId: string) => {
        navigateToVideoById(videoId);
    };

    return (
        <section className="w-full p-4">
            <h4 className="text-lg font-semibold">You may like</h4>
            <div className="md:grid @4xl:grid-cols-2 hidden grid-cols-[repeat(auto-fill,minmax(180px,1fr))]  gap-4 mt-4">
                {playlist.map((post, index) => (
                    <div key={post._id} className="relative cursor-pointer" onClick={() => handleVideoClick(post._id)}>
                        <CardVideoItem post={post} isCurrentlyPlaying={index === currentIndex} />
                    </div>
                ))}
            </div>
        </section>
    );
}
