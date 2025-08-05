import CardVideoItem from "@/components/card-video-item";
import { TikTokPostType } from "@/types/schemas/TikTokPost.schemas";
import { UserType } from "@/types/schemas/User.schema";

type SuggestedVideosProps = {
    postList: { post: TikTokPostType; user: UserType }[];
};

export default async function SuggestedVideos({ postList }: SuggestedVideosProps) {
    return (
        <section className="w-full p-4">
            <h4 className="text-lg font-semibold">You may like</h4>
            <div className="grid grid-cols-2 gap-4 mt-4 ">
                {postList.map(({ post, user }) => (
                    <CardVideoItem key={post._id} post={post} author={user} />
                ))}
            </div>
        </section>
    );
}
