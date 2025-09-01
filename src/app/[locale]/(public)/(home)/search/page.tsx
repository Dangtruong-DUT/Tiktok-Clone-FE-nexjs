import SearchResults from "@/app/[locale]/(public)/(home)/search/_components/search-result";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { LocalesType } from "@/i18n/config";
import envConfig from "@/config/app.config";

export async function generateMetadata({
    params,
    searchParams,
}: {
    params: Promise<{ locale: LocalesType }>;
    searchParams: { q?: string };
}): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations("HomePage.sidebar.search");
    const query = searchParams.q;

    return {
        title: query ? `${query} - TikTok Search` : t("title"),
        description: query
            ? `Search results for "${query}" on TikTok - find related videos and creators`
            : "Search for creators, videos, and trending content on TikTok",
        alternates: {
            canonical: `${envConfig.NEXT_PUBLIC_URL}${locale}/search?q=${query}`,
            languages: {
                "en-US": `${envConfig.NEXT_PUBLIC_URL}en/search?q=${query}`,
                "vi-VN": `${envConfig.NEXT_PUBLIC_URL}vi/search?q=${query}`,
            },
        },
    };
}

export default function SearchPage() {
    return (
        <div className="pr-60">
            <SearchResults />
        </div>
    );
}
