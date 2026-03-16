import VideoScrollWrapper from "@/app/[locale]/(public)/(home)/(foryou)/_components/video-scroll-wrapper";
import { VideosProvider } from "@/app/[locale]/(public)/(home)/(foryou)/_context/videos-provider";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { LocalesType } from "@/i18n/config";
import envConfig from "@/config/app.config";

export async function generateMetadata({ params }: { params: Promise<{ locale: LocalesType }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations("HomePage.menu");
    return {
        title: t("forYou"),
        description: "Watch the latest and most engaging videos personalized for you on TikTok",
        alternates: {
            canonical: `${envConfig.NEXT_PUBLIC_URL}${locale}`,
            languages: {
                "en-US": `${envConfig.NEXT_PUBLIC_URL}en`,
                "vi-VN": `${envConfig.NEXT_PUBLIC_URL}vi`,
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
