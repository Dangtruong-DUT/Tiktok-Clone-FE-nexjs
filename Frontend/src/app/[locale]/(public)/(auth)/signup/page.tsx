import { MenuItemsList } from "@/app/[locale]/(public)/(auth)/menu-items";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { LocalesType } from "@/i18n/config";
import envConfig from "@/config/app.config";

export async function generateMetadata({ params }: { params: Promise<{ locale: LocalesType }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations("SignUpPage");

    return {
        title: t("title"),
        description: t("description"),
        alternates: {
            canonical: `${envConfig.NEXT_PUBLIC_URL}${locale}/signup`,
            languages: {
                "en-US": `${envConfig.NEXT_PUBLIC_URL}en/signup`,
                "vi-VN": `${envConfig.NEXT_PUBLIC_URL}vi/signup`,
            },
        },
    };
}

export default async function SignUpPage() {
    const t = await getTranslations("SignUpPage");
    return (
        <div>
            <h1 className="text-2xl font-bold text-center mb-4 mt-16">{t("title")}</h1>
            <p className="text-center text-base text-neutral-500 mb-5">{t("description")}</p>
            <MenuItemsList type="signup" />
        </div>
    );
}
