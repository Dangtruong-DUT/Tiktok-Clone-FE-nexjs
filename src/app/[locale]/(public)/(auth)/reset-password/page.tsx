import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { LocalesType } from "@/i18n/config";
import ResetPasswordMain from "@/app/[locale]/(public)/(auth)/reset-password/reset-password-main";

export async function generateMetadata({ params: { locale } }: { params: { locale: LocalesType } }): Promise<Metadata> {
    const t = await getTranslations("resetPasswordPage");

    return {
        title: t("title"),
        alternates: {
            canonical: `${process.env.NEXT_PUBLIC_URL}/${locale}/reset-password`,
            languages: {
                "en-US": "/en",
                "vi-VN": "/vi",
            },
        },
    };
}

export default async function ResetPasswordPage() {
    return <ResetPasswordMain />;
}
