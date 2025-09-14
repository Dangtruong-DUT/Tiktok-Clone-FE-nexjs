"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import VideoPlayer from "@/components/video-player-v2";
import LoadingIcon from "@/components/lottie-icons/loading";
import { useVideoPlaylist } from "@/app/[locale]/(public)/(home)/[username]/video/[id]/_context/video-playlist-context";
import VideoDescription from "@/app/[locale]/(public)/(home)/[username]/video/[id]/_components/video-description";
import SuggestedVideos from "@/app/[locale]/(public)/(home)/[username]/video/[id]/_components/suggested-videos";
import CommentSection from "@/app/[locale]/(public)/(home)/[username]/video/[id]/_components/comment-section";

export default function VideoDetailContent() {
    const params = useParams();
    const { currentVideo, playVideoById } = useVideoPlaylist();

    useEffect(() => {
        if (params.id && typeof params.id === "string") {
            const urlVideoId = params.id;
            if (currentVideo && currentVideo._id !== urlVideoId) {
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
        <div className="flex min-h-screen mx-auto py-6 @container">
            <div className="grow-1">
                <VideoPlayer post={currentVideo} key={currentVideo._id} className="max-h-[calc(100vh-3.5rem)]" />
                <VideoDescription
                    author={currentVideo.author}
                    createdAt={currentVideo.author.created_at}
                    postContent={currentVideo.content}
                    className="mb-4"
                />
                <div className=" @4xl:hidden">
                    <SuggestedVideos />
                </div>
                <CommentSection postId={currentVideo._id} username={currentVideo.author.username} />
            </div>
            <div className=" hidden w-83 @4xl:flex grow-0 shrink-0 base-[332px] ">
                <SuggestedVideos />
            </div>
        </div>
    );
}
