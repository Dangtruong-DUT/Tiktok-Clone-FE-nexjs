import { TikTokPostType } from "@/types/schemas/TikTokPost.schemas";
import { UserType } from "@/types/schemas/User.schema";
import { VideoPlaylistProvider } from "@/provider/video-playlist-provider";
import VideoDetailContent from "@/app/[locale]/(public)/(home)/[username]/video/[id]/video-detail-content";
import { Metadata, ResolvingMetadata } from "next";
import { LocalesType } from "@/i18n/config";
import { WrapperServerCallApi } from "@/utils/handleErrors/handleServerError";
import PostRequestApi from "@/apis/posts.request";
import { notFound } from "next/navigation";

interface VideoDetailPageProps {
    params: Promise<{
        id: string;
        username: string;
        locale: LocalesType;
    }>;
}

export async function generateMetadata({ params }: VideoDetailPageProps, parent: ResolvingMetadata): Promise<Metadata> {
    const { username, id, locale } = await params;

    if (!username?.startsWith("%40")) {
        return {
            title: "Video not found",
            description: "The requested video could not be found.",
        };
    }

    const cleanUsername = username.replace(/^%40/, "");

    const res = await WrapperServerCallApi({
        apiCallFn: () => PostRequestApi.getPostDetailById(id),
    });

    const post: TikTokPostType | undefined = res?.data;
    const user: UserType | undefined = post?.author;

    const parentMeta = await parent;
    const previousImages = parentMeta.openGraph?.images || [];

    const videoThumb = "/images/desktop-wallpaper-tiktok.jpg";

    const displayName = user?.name || user?.username || cleanUsername;
    const postContent = post?.content?.trim().slice(0, 20) || "";

    const pageTitle = postContent ? `${displayName} on TikTok: "${postContent}"` : `${displayName} on TikTok`;

    const pageDescription = postContent || `Watch ${displayName}'s video on TikTok.`;

    const canonicalUrl = `${process.env.NEXT_PUBLIC_URL}/${locale}/%40${cleanUsername}/video/${id}`;

    return {
        title: pageTitle,
        description: pageDescription,
        openGraph: {
            title: pageTitle,
            description: pageDescription,
            type: "video.other",
            url: canonicalUrl,
            siteName: "TikTok Clone",
            locale,
            images: [videoThumb || user?.avatar || "/images/desktop-wallpaper-tiktok.jpg", ...previousImages],
        },
        alternates: {
            canonical: canonicalUrl,
            languages: {
                "en-US": `/en/%40${cleanUsername}/video/${id}`,
                "vi-VN": `/vi/%40${cleanUsername}/video/${id}`,
            },
        },
        twitter: {
            card: "player",
            title: pageTitle,
            description: pageDescription,
            images: [videoThumb || user?.avatar || "/images/desktop-wallpaper-tiktok.jpg"],
        },
    };
}
export default async function VideoDetailPage({ params }: VideoDetailPageProps) {
    const { id } = await params;

    const res = await WrapperServerCallApi({
        apiCallFn: () => PostRequestApi.getPostDetailById(id),
    });
    if (res?.data == null) {
        return notFound();
    }

    return (
        <VideoPlaylistProvider video={res.data}>
            <VideoDetailContent />
        </VideoPlaylistProvider>
    );
}
