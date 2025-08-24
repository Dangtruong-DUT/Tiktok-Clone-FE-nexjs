import userRequestApi from "@/apis/user.request";
import ProfileUser from "@/app/[locale]/(public)/(home)/[username]/_components/profile-user";
import TabBar from "@/app/[locale]/(public)/(home)/[username]/_components/TabBar";
import VideoGrid from "@/app/[locale]/(public)/(home)/[username]/_components/video-grid";
import TAB_ITEMS from "@/app/[locale]/(public)/(home)/[username]/_config/tab-items.config";
import VideosProvider from "@/app/[locale]/(public)/(home)/[username]/_context/videos.context";
import { WrapperServerCallApi } from "@/utils/handleErrors/handleServerError";
import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";

type Props = {
    params: Promise<{ username: string; locale: string }>;
};

export async function generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata> {
    const { username, locale } = await params;

    if (!username || !username.startsWith("%40")) {
        return {
            title: "User not found",
            description: "The requested user profile could not be found.",
        };
    }
    const cleanUsername = username.replace(/^%40/, "");

    const res = await WrapperServerCallApi({
        apiCallFn: () => userRequestApi.getUserByUsername(cleanUsername),
    });

    const user = res?.data;

    const previousImages = (await parent).openGraph?.images || [];

    return {
        title: user?.name ? `${user.name} (@${user.username})` : "TikTok Profile",
        description: user?.bio || `Check out ${user?.name || user?.username}'s profile on TikTok`,
        openGraph: {
            images: [user?.avatar || "", ...previousImages],
            title: user?.name ? `${user.name} (@${user.username})` : "TikTok Profile",
            description: user?.bio || `Check out ${user?.name || user?.username}'s profile on TikTok`,
            type: "profile",
            url: `${process.env.NEXT_PUBLIC_URL}/${locale}/${username}`,
            siteName: "TikTok Clone",
            locale,
        },
        alternates: {
            canonical: `${process.env.NEXT_PUBLIC_URL}/${locale}/${username}`,
            languages: {
                "en-US": "/en",
                "vi-VN": "/vi",
            },
        },
        twitter: {
            card: "summary_large_image",
            title: user?.name ? `${user.name} (@${user.username})` : "TikTok Profile",
            description: user?.bio || `Check out ${user?.name || user?.username}'s profile on TikTok`,
            images: [user?.avatar || ""],
        },
    };
}

export default async function Profile({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;

    if (!username || !username.startsWith("%40")) {
        notFound();
    }

    const cleanUsername = username.replace(/^%40/, "");

    const data = await WrapperServerCallApi({
        apiCallFn: () => userRequestApi.getUserByUsername(cleanUsername),
    });

    const userData = data?.data;

    if (!userData) {
        notFound();
    }

    return (
        <div className="w-full  px-6 py-8">
            <ProfileUser userData={userData} className="mb-5" />
            <VideosProvider userId={userData._id}>
                <TabBar tabs={TAB_ITEMS} />
                <VideoGrid />
            </VideosProvider>
        </div>
    );
}
