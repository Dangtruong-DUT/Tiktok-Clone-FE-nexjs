"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import VideoPlayer from "@/components/video-player-v2";
import VideoDescription from "@/app/[locale]/(public)/(home)/[username]/video/[id]/video-description";
import CommentSection from "@/app/[locale]/(public)/(home)/[username]/video/[id]/comment-section";
import SuggestedVideos from "@/app/[locale]/(public)/(home)/[username]/video/[id]/suggested-videos";
import { useVideoPlaylist } from "@/provider/video-playlist-provider";
import LoadingIcon from "@/components/lottie-icons/loading";

export default function VideoDetailContent() {
    const params = useParams();
    const { currentVideo, playlist, playVideoById } = useVideoPlaylist();

    useEffect(() => {
        if (params.id && typeof params.id === "string") {
            const urlVideoId = params.id;
            if (currentVideo && currentVideo.post._id !== urlVideoId) {
                playVideoById(urlVideoId);
            }
        }
    }, [params.id, currentVideo, playVideoById]);

    if (!currentVideo) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingIcon className="w-12 h-12" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen mx-auto py-6">
            <div className="grow-1">
                <VideoPlayer
                    post={currentVideo.post}
                    author={currentVideo.user}
                    className="max-h-[calc(100vh-3.5rem)]"
                />
                <VideoDescription
                    userAvatar={currentVideo.user.avatar}
                    userName={currentVideo.user.username}
                    userBio={currentVideo.user.bio}
                    isFollowing={currentVideo.user.is_followed}
                    isOwner={currentVideo.user.isOwner}
                    createdAt={currentVideo.post.created_at}
                    postContent={currentVideo.post.content}
                    className="mb-4"
                />
                <CommentSection postId={currentVideo.post._id} />
            </div>
            <div className="w-83 flex grow-0 shrink-0 base-[332px]">
                <SuggestedVideos postList={playlist} />
            </div>
        </div>
    );
}
