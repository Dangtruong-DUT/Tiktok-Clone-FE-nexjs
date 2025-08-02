"use client";

import NavigationVideo from "@/app/[locale]/(public)/(home)/(foryou)/navigation-video";
import VideoPlayer from "@/components/video-player";
import { TikTokPostType } from "@/types/schemas/TikTokPost.schemas";
import { UserType } from "@/types/schemas/User.schema";
import { useEffect, useRef, useState } from "react";

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

const postList: { post: TikTokPostType; user: UserType }[] = Array(10).fill({ post: mockVideoPost, user: mockUser });

export default function VideoScrollWrapper() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const handleScrollToIndex = (type: "UP" | "DOWN") => {
        let newIndex = currentIndex;

        if (type === "UP" && currentIndex < postList.length - 1) {
            newIndex += 1;
        } else if (type === "DOWN" && currentIndex > 0) {
            newIndex -= 1;
        }

        const element = document.querySelector(`[data-scroll-index="${newIndex}"]`);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
            setCurrentIndex(newIndex);
        }
    };

    return (
        <>
            <div className=" max-h-screen w-full  overflow-y-auto  snap-y snap-mandatory scrollbar-hidden">
                {postList.map((item, index) => (
                    <article
                        key={String(item.post._id + index)}
                        data-scroll-index={index}
                        className="px-4 lg:ps-[3rem] lg:pe-[15rem]  py-4 min-h-screen snap-start snap-always"
                    >
                        <VideoPlayer post={item.post} author={item.user} className="sm:max-w-[400px] mx-auto" />
                    </article>
                ))}
            </div>
            <NavigationVideo
                handleClickNextBtn={() => handleScrollToIndex("UP")}
                handleClickPrevBtn={() => handleScrollToIndex("DOWN")}
                isDisabledDown={currentIndex === postList.length - 1}
                isDisabledUp={currentIndex === 0}
            />
        </>
    );
}
