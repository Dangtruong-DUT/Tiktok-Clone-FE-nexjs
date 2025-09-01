import { BRAND_CONFIG } from "@/config/brand.config";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { LocalesType } from "@/i18n/config";
import envConfig from "@/config/app.config";
import React from "react";

export async function generateMetadata({ params }: { params: Promise<{ locale: LocalesType }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations("Legal");

    return {
        title: t("privacyPolicy.title"),
        description: t("privacyPolicy.sections.introduction.description", {
            appName: BRAND_CONFIG.APP_NAME,
            companyName: BRAND_CONFIG.COMPANY_NAME,
        }),
        openGraph: {
            title: t("privacyPolicy.title"),
            description: t("privacyPolicy.sections.introduction.description", {
                appName: BRAND_CONFIG.APP_NAME,
                companyName: BRAND_CONFIG.COMPANY_NAME,
            }),
            type: "website",
            url: `${envConfig.NEXT_PUBLIC_URL}${locale}/privacy-policy`,
            siteName: BRAND_CONFIG.APP_NAME,
        },
        alternates: {
            canonical: `${envConfig.NEXT_PUBLIC_URL}${locale}/privacy-policy`,
            languages: {
                "en-US": `${envConfig.NEXT_PUBLIC_URL}en/privacy-policy`,
                "vi-VN": `${envConfig.NEXT_PUBLIC_URL}vi/privacy-policy`,
            },
        },
    };
}

type TranslationKeyMap = {
    "privacyPolicy.sections.dataCollection.userProvided.items": string[];
    "privacyPolicy.sections.dataCollection.automatic.items": string[];
    "privacyPolicy.sections.dataUse.items": string[];
    "privacyPolicy.sections.dataSharing.items": string[];
    "privacyPolicy.sections.userRights.items": string[];
};

type ParamsMap = {
    "meta.lastUpdated": { date: string };
    "privacyPolicy.sections.introduction.description": { appName: string; companyName: string };
    "privacyPolicy.sections.dataSharing.items.3": { companyName: string };
};

export default async function PrivacyPolicyPage() {
    const t = (await getTranslations("Legal")) as unknown as {
        <K extends keyof TranslationKeyMap>(key: K): TranslationKeyMap[K];
        <K extends keyof ParamsMap>(key: K, params: ParamsMap[K]): string;
        (key: string): string;
    };
    return (
        <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300 mx-auto">
            <section
                className="relative py-24 px-4 md:px-6 lg:px-8 bg-center bg-cover"
                style={{ backgroundImage: "url('/images/Knowledge for you.png')" }}
            >
                <div className="absolute inset-0 bg-black/50 dark:bg-black/70"></div>
                <div className="relative max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl tracking-tight drop-shadow-lg animate-fade-in">
                        {t("privacyPolicy.title")}
                    </h1>
                    <div className="mt-4">
                        <p className="text-sm text-white font-medium drop-shadow">
                            {t("meta.lastUpdated", { date: "September 1, 2025" })}
                        </p>
                    </div>
                </div>
            </section>

            <section className="py-16 md:py-24 lg:py-32 px-4 md:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto space-y-12">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-l-4 border-brand pl-4">
                            {t("privacyPolicy.sections.introduction.title")}
                        </h2>
                        <p className="mt-4 text-gray-700 dark:text-gray-300 leading-7">
                            {t("privacyPolicy.sections.introduction.description", {
                                appName: BRAND_CONFIG.APP_NAME,
                                companyName: BRAND_CONFIG.COMPANY_NAME,
                            })}
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-l-4 border-brand pl-4">
                            {t("privacyPolicy.sections.dataCollection.title")}
                        </h2>
                        <p className="mt-4 text-gray-700 dark:text-gray-300 leading-7">
                            {t("privacyPolicy.sections.dataCollection.description")}
                        </p>
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mt-6 pl-4">
                            {t("privacyPolicy.sections.dataCollection.userProvided.title")}
                        </h3>
                        <ul className="mt-4 space-y-2 text-gray-700 dark:text-gray-300 leading-7 list-disc list-inside">
                            {[1, 2, 3].map((index) => (
                                <li key={index}>
                                    {t(`privacyPolicy.sections.dataCollection.userProvided.items.${index}`)}
                                </li>
                            ))}
                        </ul>

                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mt-6 pl-4">
                            {t("privacyPolicy.sections.dataCollection.thirdParty.title")}
                        </h3>
                        <p className="mt-4 text-gray-700 dark:text-gray-300 leading-7">
                            {t("privacyPolicy.sections.dataCollection.thirdParty.description")}
                        </p>

                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mt-6 pl-4">
                            {t("privacyPolicy.sections.dataCollection.automatic.title")}
                        </h3>
                        <ul className="mt-4 space-y-2 text-gray-700 dark:text-gray-300 leading-7 list-disc list-inside">
                            {[1, 2, 3, 4].map((index) => (
                                <li key={index}>
                                    {t(`privacyPolicy.sections.dataCollection.automatic.items.${index}`)}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-l-4 border-brand pl-4">
                            {t("privacyPolicy.sections.dataUse.title")}
                        </h2>
                        <p className="mt-4 text-gray-700 dark:text-gray-300 leading-7">
                            {t("privacyPolicy.sections.dataUse.description")}
                        </p>
                        <ul className="mt-4 space-y-2 text-gray-700 dark:text-gray-300 leading-7 list-disc list-inside">
                            {[1, 2, 3, 4, 5, 6].map((index) => (
                                <li key={index}>{t(`privacyPolicy.sections.dataUse.items.${index}`)}</li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-l-4 border-brand pl-4">
                            {t("privacyPolicy.sections.dataSharing.title")}
                        </h2>
                        <p className="mt-4 text-gray-700 dark:text-gray-300 leading-7">
                            {t("privacyPolicy.sections.dataSharing.description")}
                        </p>
                        <ul className="mt-4 space-y-2 text-gray-700 dark:text-gray-300 leading-7 list-disc list-inside">
                            {[1, 2].map((index) => (
                                <li key={index}>{t(`privacyPolicy.sections.dataSharing.items.${index}`)}</li>
                            ))}
                            <li>
                                {t(`privacyPolicy.sections.dataSharing.items.3`, {
                                    companyName: BRAND_CONFIG.COMPANY_NAME,
                                })}
                            </li>
                            <li>{t(`privacyPolicy.sections.dataSharing.items.4`)}</li>
                        </ul>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-l-4 border-brand pl-4">
                            {t("privacyPolicy.sections.dataRetention.title")}
                        </h2>
                        <p className="mt-4 text-gray-700 dark:text-gray-300 leading-7">
                            {t("privacyPolicy.sections.dataRetention.description")}
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-l-4 border-brand pl-4">
                            {t("privacyPolicy.sections.userRights.title")}
                        </h2>
                        <p className="mt-4 text-gray-700 dark:text-gray-300 leading-7">
                            {t("privacyPolicy.sections.userRights.description")}
                        </p>
                        <ul className="mt-4 space-y-2 text-gray-700 dark:text-gray-300 leading-7 list-disc list-inside">
                            {[1, 2, 3, 4].map((index) => (
                                <li key={index}>{t(`privacyPolicy.sections.userRights.items.${index}`)}</li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-l-4 border-brand pl-4">
                            {t("privacyPolicy.sections.childrenPrivacy.title")}
                        </h2>
                        <p className="mt-4 text-gray-700 dark:text-gray-300 leading-7">
                            {t("privacyPolicy.sections.childrenPrivacy.description")}
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-l-4 border-brand pl-4">
                            {t("privacyPolicy.sections.changes.title")}
                        </h2>
                        <p className="mt-4 text-gray-700 dark:text-gray-300 leading-7">
                            {t("privacyPolicy.sections.changes.description")}
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-l-4 border-brand pl-4">
                            {t("privacyPolicy.sections.contact.title")}
                        </h2>
                        <p className="mt-4 text-gray-700 dark:text-gray-300 leading-7">
                            {t("privacyPolicy.sections.contact.description")}{" "}
                            <a
                                href={`mailto:${t("privacyPolicy.sections.contact.email")}`}
                                className="text-brand hover:underline font-medium transition-colors duration-200"
                            >
                                {t("privacyPolicy.sections.contact.email")}
                            </a>
                            .
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
