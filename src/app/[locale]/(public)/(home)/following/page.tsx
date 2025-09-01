import VideoScrollWrapper from "@/app/[locale]/(public)/(home)/following/_components/video-scroll-wrapper";
import { VideosProvider } from "@/app/[locale]/(public)/(home)/following/_context/videos-provider";
import { getTranslations } from "next-intl/server";
import { Metadata, ResolvingMetadata } from "next";
import { LocalesType } from "@/i18n/config";
import envConfig from "@/config/app.config";

export async function generateMetadata({
    params,
    parent,
}: {
    params: Promise<{ locale: LocalesType }>;
    parent: ResolvingMetadata;
}): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations("HomePage.menu");
    const parentMeta = await parent;
    const images = parentMeta.openGraph?.images || [];
    return {
        title: t("following"),
        description: "Keep up with all the latest videos from creators you follow on TikTok",
        openGraph: {
            title: t("following"),
            description: "Keep up with all the latest videos from creators you follow on TikTok",
            images: images,
            url: `${process.env.NEXT_PUBLIC_URL}${locale}/following`,
        },
        alternates: {
            canonical: `${envConfig.NEXT_PUBLIC_URL}${locale}/following`,
            languages: {
                "en-US": `${envConfig.NEXT_PUBLIC_URL}en/following`,
                "vi-VN": `${envConfig.NEXT_PUBLIC_URL}vi/following`,
            },
        },
    };
}

export default function HomePage() {
    return (
        <div className=" h-screen flex ">
            <VideosProvider>
                <VideoScrollWrapper />
            </VideosProvider>
        </div>
    );
}
