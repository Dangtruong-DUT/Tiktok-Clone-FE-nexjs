import ForgotPasswordForm from "@/app/[locale]/(public)/(auth)/forgot-password/forgot-password-form";
import { getTranslations } from "next-intl/server";
import { Metadata, ResolvingMetadata } from "next";
import { LocalesType } from "@/i18n/config";
import envConfig from "@/config/app.config";

export async function generateMetadata(
    { params }: { params: Promise<{ locale: LocalesType }> },
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations("forgotPasswordPage");
    const parentMeta = await parent;
    const images = parentMeta.openGraph?.images || [];
    return {
        title: t("title"),
        description: "Reset your TikTok account password securely",
        openGraph: {
            title: t("title"),
            description: "Reset your TikTok account password securely",
            images,
            url: `${envConfig.NEXT_PUBLIC_URL}${locale}/forgot-password`,
        },
        alternates: {
            canonical: `${envConfig.NEXT_PUBLIC_URL}${locale}/forgot-password`,
            languages: {
                "en-US": `${envConfig.NEXT_PUBLIC_URL}en/forgot-password`,
                "vi-VN": `${envConfig.NEXT_PUBLIC_URL}vi/forgot-password`,
            },
        },
    };
}

export default async function ForgotPasswordPage() {
    const t = await getTranslations("forgotPasswordPage");
    return (
        <div className="w-full max-w-sm mx-auto px-4 ">
            <h1 className="text-3xl my-4 font-bold text-center mt-16">{t("title")}</h1>
            <ForgotPasswordForm />
        </div>
    );
}
