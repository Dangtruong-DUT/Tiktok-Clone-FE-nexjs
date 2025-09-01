import ClearTokenByServer from "@/app/[locale]/(public)/(auth)/login/clear-token-by-server";
import { MenuItemsList } from "@/app/[locale]/(public)/(auth)/menu-items";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { LocalesType } from "@/i18n/config";

export async function generateMetadata({ params: { locale } }: { params: { locale: LocalesType } }): Promise<Metadata> {
    const t = await getTranslations("LoginPage");

    return {
        title: t("title"),
        description: t("description"),
        alternates: {
            canonical: `${process.env.NEXT_PUBLIC_URL}/${locale}/login`,
            languages: {
                "en-US": "/en",
                "vi-VN": "/vi",
            },
        },
    };
}

export default async function LoginPage() {
    const t = await getTranslations("LoginPage");
    return (
        <div>
            <h1 className="text-2xl font-bold text-center mb-4 mt-16">{t("title")}</h1>
            <p className="text-center text-base text-neutral-500 mb-5">{t("description")}</p>
            <MenuItemsList type="login" />
            <ClearTokenByServer />
        </div>
    );
}
