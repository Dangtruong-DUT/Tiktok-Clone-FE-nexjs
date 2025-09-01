import { BRAND_CONFIG } from "@/config/brand.config";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { LocalesType } from "@/i18n/config";
import envConfig from "@/config/app.config";
import React from "react";

export async function generateMetadata({ params }: { params: Promise<{ locale: LocalesType }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = (await getTranslations("Legal.termsOfService")) as unknown as {
        <K extends keyof ParamsMap>(key: K, params: ParamsMap[K]): string;
        (key: string): string;
    };

    const title = t("title");
    const description = "terms of service for TikTok";

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: "website",
            url: `${envConfig.NEXT_PUBLIC_URL}${locale}/terms-of-service`,
            siteName: BRAND_CONFIG.APP_NAME,
            images: [
                {
                    url: "https://api.taplamit.tech/api/v1/static/images/72e81f3e59013ce9726567704.jpg",
                    width: 1200,
                    height: 630,
                    alt: "TaplamIT - Tiktok",
                },
            ],
        },
        alternates: {
            canonical: `${envConfig.NEXT_PUBLIC_URL}${locale}/terms-of-service`,
            languages: {
                "en-US": `${envConfig.NEXT_PUBLIC_URL}en/terms-of-service`,
                "vi-VN": `${envConfig.NEXT_PUBLIC_URL}vi/terms-of-service`,
            },
        },
    };
}

type ParamsMap = {
    "meta.lastUpdated": { date: string };
    "termsOfService.sections.acceptance.description": { appName: string; companyName: string };
    "termsOfService.sections.account.description.creation": { appName: string };
    "termsOfService.sections.account.description.oauth": { appName: string };
    "termsOfService.sections.userContent.description.license": { companyName: string };
    "termsOfService.sections.intellectual.description.ownership": { companyName: string };
    "termsOfService.sections.liability.description": { companyName: string };
    "termsOfService.sections.governing.description": { jurisdiction: string };
    "termsOfService.sections.contact.email": { email: string };
    "termsOfService.sections.disclaimer.description": Record<string, never>;
    "termsOfService.sections.changes.description": Record<string, never>;
};

export default async function TermsOfServicePage() {
    const t = (await getTranslations("Legal")) as unknown as {
        <K extends keyof ParamsMap>(key: K, params: ParamsMap[K]): string;
        (key: string): string;
    };
    return (
        <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300 mx-auto">
            <section
                className="relative py-24 px-4 md:px-6 lg:px-8 bg-center bg-cover"
                style={{ backgroundImage: "url('/images/desktop-wallpaper-tiktok.jpg')" }}
            >
                <div className="absolute inset-0 bg-black/50 dark:bg-black/70"></div>
                <div className="relative max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl tracking-tight drop-shadow-lg animate-fade-in">
                        {t("termsOfService.title")}
                    </h1>
                    <p className="text-sm text-white font-medium drop-shadow mt-4">
                        {t("meta.lastUpdated", { date: "September 1, 2025" })}
                    </p>
                </div>
            </section>

            <section className="py-16 md:py-24 lg:py-32 px-4 md:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto space-y-12">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-l-4 border-brand pl-4">
                            {t("termsOfService.sections.acceptance.title")}
                        </h2>
                        <p className="mt-4 text-gray-700 dark:text-gray-300 leading-7">
                            {t("termsOfService.sections.acceptance.description", {
                                appName: BRAND_CONFIG.APP_NAME,
                                companyName: BRAND_CONFIG.COMPANY_NAME,
                            })}
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-l-4 border-brand pl-4">
                            {t("termsOfService.sections.eligibility.title")}
                        </h2>
                        <p className="mt-4 text-gray-700 dark:text-gray-300 leading-7">
                            {t("termsOfService.sections.eligibility.description")}
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-l-4 border-brand pl-4">
                            {t("termsOfService.sections.account.title")}
                        </h2>
                        <p className="mt-4 text-gray-700 dark:text-gray-300 leading-7">
                            {t("termsOfService.sections.account.description.creation", {
                                appName: BRAND_CONFIG.APP_NAME,
                            })}
                        </p>
                        <p className="mt-4 text-gray-700 dark:text-gray-300 leading-7">
                            {t("termsOfService.sections.account.description.oauth", { appName: BRAND_CONFIG.APP_NAME })}
                        </p>
                        <p className="mt-4 text-gray-700 dark:text-gray-300 leading-7">
                            {t("termsOfService.sections.account.description.responsibility")}
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-l-4 border-brand pl-4">
                            {t("termsOfService.sections.userContent.title")}
                        </h2>
                        <p className="mt-4 text-gray-700 dark:text-gray-300 leading-7">
                            {t("termsOfService.sections.userContent.description.ownership")}
                        </p>
                        <p className="mt-4 text-gray-700 dark:text-gray-300 leading-7">
                            {t("termsOfService.sections.userContent.description.license", {
                                companyName: BRAND_CONFIG.COMPANY_NAME,
                            })}
                        </p>
                        <p className="mt-4 text-gray-700 dark:text-gray-300 leading-7">
                            {t("termsOfService.sections.userContent.description.responsibility")}
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-l-4 border-brand pl-4">
                            {t("termsOfService.sections.prohibited.title")}
                        </h2>
                        <p className="mt-4 text-gray-700 dark:text-gray-300 leading-7">
                            {t("termsOfService.sections.prohibited.description")}
                        </p>
                        <ul className="mt-4 space-y-4 text-gray-700 dark:text-gray-300 leading-7 list-disc list-inside">
                            {[1, 2, 3, 4, 5, 6, 7].map((index) => (
                                <li key={index}>{t(`termsOfService.sections.prohibited.items.${index}`)}</li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-l-4 border-brand pl-4">
                            {t("termsOfService.sections.moderation.title")}
                        </h2>
                        <p className="mt-4 text-gray-700 dark:text-gray-300 leading-7">
                            {t("termsOfService.sections.moderation.description")}
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-l-4 border-brand pl-4">
                            {t("termsOfService.sections.intellectual.title")}
                        </h2>
                        <p className="mt-4 text-gray-700 dark:text-gray-300 leading-7">
                            {t("termsOfService.sections.intellectual.description.ownership", {
                                companyName: BRAND_CONFIG.COMPANY_NAME,
                            })}
                        </p>
                        <p className="mt-4 text-gray-700 dark:text-gray-300 leading-7">
                            {t("termsOfService.sections.intellectual.description.dmca")}
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-l-4 border-brand pl-4">
                            {t("termsOfService.sections.termination.title")}
                        </h2>
                        <p className="mt-4 text-gray-700 dark:text-gray-300 leading-7">
                            {t("termsOfService.sections.termination.description")}
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-l-4 border-brand pl-4">
                            {t("termsOfService.sections.disclaimer.title")}
                        </h2>
                        <p className="mt-4 text-gray-700 dark:text-gray-300 leading-7">
                            {t("termsOfService.sections.disclaimer.description")}
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-l-4 border-brand pl-4">
                            {t("termsOfService.sections.liability.title")}
                        </h2>
                        <p className="mt-4 text-gray-700 dark:text-gray-300 leading-7">
                            {t("termsOfService.sections.liability.description", {
                                companyName: BRAND_CONFIG.COMPANY_NAME,
                            })}
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-l-4 border-brand pl-4">
                            {t("termsOfService.sections.governing.title")}
                        </h2>
                        <p className="mt-4 text-gray-700 dark:text-gray-300 leading-7">
                            {t("termsOfService.sections.governing.description", {
                                jurisdiction: BRAND_CONFIG.JURISDICTION,
                            })}
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-l-4 border-brand pl-4">
                            {t("termsOfService.sections.changes.title")}
                        </h2>
                        <p className="mt-4 text-gray-700 dark:text-gray-300 leading-7">
                            {t("termsOfService.sections.changes.description")}
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-l-4 border-brand pl-4">
                            {t("termsOfService.sections.contact.title")}
                        </h2>
                        <p className="mt-4 text-gray-700 dark:text-gray-300 leading-7">
                            {t("termsOfService.sections.contact.description")}{" "}
                            <a
                                href={`mailto:${BRAND_CONFIG.CONTACT_EMAIL}`}
                                className="text-brand hover:underline font-medium transition-colors duration-200"
                            >
                                {t("termsOfService.sections.contact.email", { email: BRAND_CONFIG.CONTACT_EMAIL })}
                            </a>
                            .
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
