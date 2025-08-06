import { TikTokPostType } from "@/types/schemas/TikTokPost.schemas";
import { UserType } from "@/types/schemas/User.schema";
import { postList as postListMock } from "@/app/[locale]/(public)/(home)/(foryou)/mock";
import { VideoPlaylistProvider } from "@/provider/video-playlist-provider";
import VideoDetailContent from "@/app/[locale]/(public)/(home)/[username]/video/[id]/video-detail-content";

interface VideoDetailPageProps {
    params: Promise<{
        id: string;
        username: string;
    }>;
}

export default async function VideoDetailPage({ params }: VideoDetailPageProps) {
    const { id, username } = await params;

    const postList: { post: TikTokPostType; user: UserType }[] = postListMock;

    // Find current video index based on URL params
    const currentVideoIndex = postList.findIndex((item) => item.post._id === id && item.user.username === username);

    // If video not found, default to first video
    const initialIndex = currentVideoIndex !== -1 ? currentVideoIndex : 0;

    return (
        <VideoPlaylistProvider initialPlaylist={postList} initialIndex={initialIndex}>
            <VideoDetailContent />
        </VideoPlaylistProvider>
    );
}
