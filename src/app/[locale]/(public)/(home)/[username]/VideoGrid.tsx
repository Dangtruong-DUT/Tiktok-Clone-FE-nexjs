import CardVideoItem from "@/components/card-video-item";
import { TikTokPostType } from "@/types/schemas/TikTokPost.schemas";
import { UserType } from "@/types/schemas/User.schema";

interface VideoGridProps {
    videos: {
        post: TikTokPostType;
        author: UserType;
    }[];
}

function VideoGrid({ videos }: VideoGridProps) {
    return (
        <div className="mt-6 w-full">
            <div className="grid gap-6 gap-x-4 grid-cols-[repeat(auto-fill,minmax(240px,1fr))] w-full max-md:grid-cols-[repeat(auto-fill,minmax(180px,1fr))]">
                {videos.map((video, index) => (
                    <div key={index}>
                        <CardVideoItem post={video.post} author={video.author} />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default VideoGrid;
