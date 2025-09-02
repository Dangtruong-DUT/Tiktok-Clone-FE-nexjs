import type { Metadata } from "next";
import "./globals.css";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { LocalesType } from "@/i18n/config";
import { tiktokDisplayFont, tiktokFont } from "@/config/font";
import { ThemeProvider } from "@/provider/theme-provider";
import { AppProvider } from "@/provider/app-provider";
import StoreProvider from "@/provider/store-provider";
import envConfig from "@/config/app.config";
import BannerKiNiem80NamVietNamFixed from "@/components/banner-ki-niem-2-9-fixed";

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;

    return {
        title: {
            template: "%s | Tiktok",
            default: "Tiktok",
        },
        description: "tiktok",
        authors: [{ name: "TaplamIT", url: "https://taplamit.com" }],
        openGraph: {
            title: "Tiktok",
            description: "tiktok",
            locale,
            type: "website",
            url: `${envConfig.NEXT_PUBLIC_URL}${locale}`,
            siteName: "Tiktok",
            images: [
                {
                    url: "https://api.taplamit.tech/api/v1/static/images/72e81f3e59013ce9726567704.jpg",
                    width: 1200,
                    height: 630,
                    alt: "TaplamIT - Tiktok",
                },
            ],
        },
        creator: "TaplamIT",
        publisher: "TaplamIT",
        alternates: {
            canonical: "/",
            languages: {
                "en-US": "/en-US",
                "vi-VN": "/vi-VN",
            },
        },
        formatDetection: {
            email: false,
            address: false,
            telephone: false,
        },
    };
}

export default async function LocaleLayout({
    children,
    params,
}: Readonly<{
    children: React.ReactNode;
    params: Promise<{ locale: LocalesType }>;
}>) {
    // Ensure that the incoming `locale` is valid
    const { locale } = await params;
    if (!hasLocale(routing.locales, locale)) {
        notFound();
    }

    return (
        <html lang={locale} suppressHydrationWarning>
            <body className={`${tiktokDisplayFont.variable} ${tiktokFont.variable} antialiased`}>
                <NextIntlClientProvider>
                    <StoreProvider>
                        <AppProvider>
                            <ThemeProvider
                                attribute="class"
                                defaultTheme="system"
                                enableSystem
                                disableTransitionOnChange
                            >
                                {children}
                                <BannerKiNiem80NamVietNamFixed />
                            </ThemeProvider>
                        </AppProvider>
                    </StoreProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
