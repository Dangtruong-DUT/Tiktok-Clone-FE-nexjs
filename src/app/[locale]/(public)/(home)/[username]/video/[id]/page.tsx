import VideoPlayer from "@/components/video-player-v2";
import { TikTokPostType } from "@/types/schemas/TikTokPost.schemas";
import { UserType } from "@/types/schemas/User.schema";
import { postList as postListMock } from "@/app/[locale]/(public)/(home)/(foryou)/mock";
import VideoDescription from "@/app/[locale]/(public)/(home)/[username]/video/[id]/video-description";
import CommentSection from "@/app/[locale]/(public)/(home)/[username]/video/[id]/comment-section";

export default function VideoDetailPage() {
    const postList: { post: TikTokPostType; user: UserType }[] = postListMock;
    const currentPost = postList[0];
    return (
        <div className="flex  min-h-screen mx-auto py-6">
            <div className="grow-1">
                <VideoPlayer post={currentPost.post} author={currentPost.user} className="max-h-[calc(100vh-3.5rem)]" />
                <VideoDescription
                    userAvatar={currentPost.user.avatar}
                    userName={currentPost.user.name}
                    userBio={currentPost.user.bio}
                    isFollowing={currentPost.user.is_followed}
                    isOwner={currentPost.user.isOwner}
                    createdAt={currentPost.post.created_at}
                    postContent={currentPost.post.content}
                    className="mb-4"
                />
                <CommentSection postId={currentPost.post._id} />
            </div>
            <div className="w-83  flex grow-0 shrink-0 base-[332px]">suggested videos</div>
        </div>
    );
}
