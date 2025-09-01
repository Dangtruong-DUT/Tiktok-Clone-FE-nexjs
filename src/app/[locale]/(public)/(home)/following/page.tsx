import VideoScrollWrapper from "@/app/[locale]/(public)/(home)/following/_components/video-scroll-wrapper";
import { VideosProvider } from "@/app/[locale]/(public)/(home)/following/_context/videos-provider";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { LocalesType } from "@/i18n/config";
import envConfig from "@/config/app.config";

export async function generateMetadata({ params }: { params: Promise<{ locale: LocalesType }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations("HomePage.menu");
    return {
        title: t("following"),
        description: "Keep up with all the latest videos from creators you follow on TikTok",
        openGraph: {
            title: t("following"),
            description: "Keep up with all the latest videos from creators you follow on TikTok",
            images: ["https://api.taplamit.tech/api/v1/static/images/72e81f3e59013ce9726567704.jpg"],
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
