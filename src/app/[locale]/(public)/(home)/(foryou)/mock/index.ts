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
    following_count: 100,
    followers_count: 200,
    is_followed: false,
    isOwner: false,
};

export const postList: { post: TikTokPostType; user: UserType }[] = Array(10)
    .fill({
        post: mockVideoPost,
        user: mockUser,
    })
    .map((item, index) => ({
        post: {
            ...item.post,
            _id: `${item.post._id}-${index}`,
        },
        user: {
            ...item.user,
            _id: `${item.user._id}-${index}`,
            username: `${item.user.username}-${index}`,
        },
    }));
