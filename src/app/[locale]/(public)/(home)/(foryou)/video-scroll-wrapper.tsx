"use client";

import ActionBar from "@/app/[locale]/(public)/(home)/(foryou)/action-video-bar";
import NavigationVideo from "@/app/[locale]/(public)/(home)/(foryou)/navigation-video";
import VideoPlayer from "@/components/video-player";
import { TikTokPostType } from "@/types/schemas/TikTokPost.schemas";
import { UserType } from "@/types/schemas/User.schema";
import { useCallback, useEffect, useState } from "react";

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

const postList: { post: TikTokPostType; user: UserType }[] = Array(10).fill({ post: mockVideoPost, user: mockUser });

export default function VideoScrollWrapper() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const handleScrollToIndex = useCallback(
        (direction: "UP" | "DOWN") => {
            const delta = direction === "UP" ? 1 : -1;
            const newIndex = currentIndex + delta;

            if (newIndex < 0 || newIndex >= postList.length || newIndex === currentIndex) return;

            const target = document.querySelector<HTMLElement>(`[data-scroll-index="${newIndex}"]`);
            if (target) {
                target.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        },
        [currentIndex]
    );

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const index = Number(entry.target.getAttribute("data-scroll-index"));
                    setCurrentIndex(index);
                }
            });
        });

        const elements = document.querySelectorAll("[data-scroll-index]");
        elements.forEach((element) => observer.observe(element));

        return () => {
            elements.forEach((element) => observer.unobserve(element));
        };
    }, []);

    return (
        <>
            <div className=" max-h-screen w-full  overflow-y-auto  snap-y snap-mandatory scrollbar-hidden">
                {postList.map((item, index) => (
                    <article
                        key={String(item.post._id + index)}
                        data-scroll-index={index}
                        className="px-4 lg:ps-[3rem] lg:pe-[15rem]  py-4 min-h-screen snap-start snap-always "
                    >
                        <div className="flex flex-row items-end justify-center space-x-4 mx-auto">
                            <VideoPlayer post={item.post} author={item.user} className="sm:max-w-[400px]" />
                            <ActionBar post={item.post} author={item.user} className="mt-4" />
                        </div>
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
