import VideoPlayer from "@/components/video-player";
import { TikTokPostType } from "@/types/schemas/TikTokPost.schemas";
import { UserType } from "@/types/schemas/User.schema";

const mockVideoPost: TikTokPostType = {
    _id: "12345",
    user_id: "67890",
    type: 0,
    audience: 0,
    content:
        "lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    parent_id: null,
    hashtags: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    medias: [
        {
            url: "http://localhost:3000/video.mp4",
            type: 0,
        },
    ],
    mentions: [],
    likes_count: 100,
    bookmarks_count: 50,
    repost_count: 10,
    comment_count: 5,
    quote_post_count: 2,
    is_liked: false,
    is_bookmarked: false,
    guest_views: 200,
    user_views: 150,
};

const mockUser: UserType = {
    _id: "67890",
    username: "mockuser",
    email: "mockuser@example.com",
    password: "hashedpassword",
    date_of_birth: "2000-01-01",
    updated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    verify: 0,
    bio: "This is a mock user bio.",
    location: "Mock City",
    website: "http://mockuser.com",
    avatar: "http://localhost:3000/avatar.jpg",
    cover_photo: "http://localhost:3000/cover.jpg",
    name: "Mock User",
};

export default function HomePage() {
    return (
        <div className=" max-h-screen w-full  overflow-y-auto  snap-y snap-mandatory scrollbar-hidden">
            <article className="px-4 lg:ps-[3rem] lg:pe-[15rem]  py-4 min-h-screen snap-start snap-always">
                <VideoPlayer post={mockVideoPost} author={mockUser} className="sm:max-w-[400px] mx-auto" />
            </article>
            <article className="px-4 lg:ps-[3rem] lg:pe-[15rem]  py-4 min-h-screen snap-start snap-always">
                <VideoPlayer post={mockVideoPost} author={mockUser} className="sm:max-w-[400px] mx-auto" />
            </article>
        </div>
    );
}
