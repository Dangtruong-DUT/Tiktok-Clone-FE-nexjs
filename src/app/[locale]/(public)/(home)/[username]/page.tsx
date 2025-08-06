"use client";

import { useMemo, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import ProfileHeader from "./ProfileHeader";
import TabBar from "./TabBar";
import VideoGrid from "./VideoGrid";
import { Grid3X3, Heart, Bookmark } from "lucide-react";

import { TikTokPostType } from "@/types/schemas/TikTokPost.schemas";
import { UserType } from "@/types/schemas/User.schema";

interface UserData {
    first_name: string;
    last_name: string;
    nickname: string;
    bio?: string;
    avatar: string;
    followings_count: number;
    followers_count: number;
    likes_count: number;
    tick?: boolean;
    videos?: {
        post: TikTokPostType;
        author: UserType;
    }[];
}

// Mock hook - replace with actual implementation
function useUserData(username: string | undefined) {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Mock API call - replace with actual API
        const fetchUserData = async () => {
            try {
                setLoading(true);
                // Simulate API call
                await new Promise((resolve) => setTimeout(resolve, 1000));

                // Mock data
                setUserData({
                    first_name: "John",
                    last_name: "Doe",
                    nickname: `@${username}`,
                    bio: "Content creator and developer",
                    avatar: "/images/desktop-wallpaper-tiktok.jpg",
                    followings_count: 150,
                    followers_count: 1200,
                    likes_count: 5400,
                    tick: true,
                    videos: [],
                });
            } catch (err) {
                setError("Failed to fetch user data");
            } finally {
                setLoading(false);
            }
        };

        if (username) {
            fetchUserData();
        }
    }, [username]);

    return { userData, loading, error };
}

export default function Profile() {
    const params = useParams();
    const username = params?.username as string;
    const { userData, loading, error } = useUserData(username);

    const tabs = useMemo(
        () => [
            { heading: "Videos", icon: <Grid3X3 width="1.2em" height="1.2em" /> },
            { heading: "Favorites", icon: <Bookmark width="1.2em" height="1.2em" /> },
            { heading: "Liked", icon: <Heart width="1.2em" height="1.2em" /> },
        ],
        []
    );

    const [activeTab, setActiveTab] = useState(tabs[0].heading);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-lg text-gray-600">Loading...</div>
            </div>
        );
    }

    if (error || !userData) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-lg text-red-600">Error: {error || "Unable to fetch user data."}</div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto px-4 py-6">
            <ProfileHeader
                name={`${userData.last_name} ${userData.first_name}`}
                nickname={userData.nickname}
                bio={userData.bio}
                avatar={userData.avatar}
                following={userData.followings_count}
                followers={userData.followers_count}
                likes={userData.likes_count}
                tick={userData.tick}
            />
            <div className="mt-8">
                <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
            </div>
            <div className="mt-6">
                <VideoGrid videos={userData.videos || []} />
                {userData.videos?.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-600 text-lg">No videos available.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
