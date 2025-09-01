import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { LocalesType } from "@/i18n/config";
import ResetPasswordMain from "@/app/[locale]/(public)/(auth)/reset-password/reset-password-main";
import envConfig from "@/config/app.config";

export async function generateMetadata({ params }: { params: Promise<{ locale: LocalesType }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations("resetPasswordPage");

    return {
        title: t("title"),
        alternates: {
            canonical: `${envConfig.NEXT_PUBLIC_URL}${locale}/reset-password`,
            languages: {
                "en-US": `${envConfig.NEXT_PUBLIC_URL}en/reset-password`,
                "vi-VN": `${envConfig.NEXT_PUBLIC_URL}vi/reset-password`,
            },
        },
    };
}

export default async function ResetPasswordPage() {
    return <ResetPasswordMain />;
}
