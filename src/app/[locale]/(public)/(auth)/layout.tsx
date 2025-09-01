import { AuthNav } from "@/app/[locale]/(public)/(auth)/auth-nav";
import Footer from "@/components/footer-v1";
import Header from "@/components/header-v1";
import { LocalesType } from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function AuthLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: LocalesType }>;
}) {
    const { locale } = await params;
    // Enable static rendering
    setRequestLocale(locale);
    const t = await getTranslations("AuthLayout");

    return (
        <div className="bg-white text-black ">
            <Header classname="bg-white text-black" />
            <main className=" h-[calc(100vh-3.75rem-5.25rem-4rem-5rem)] overflow-auto">{children}</main>
            <div className="mb-4 h-[4rem]">
                <p className="text-xs text-neutral-500 text-center max-w-sm mx-auto p-4" aria-live="polite">
                    {t.rich("notice", {
                        terms: (chunks) => (
                            <Link
                                href="/terms-of-service"
                                target="_blank"
                                className="font-semibold text-black hover:underline"
                            >
                                {chunks}
                            </Link>
                        ),
                        privacy: (chunks) => (
                            <Link
                                href="/privacy-policy"
                                target="_blank"
                                className="font-semibold text-black hover:underline"
                            >
                                {chunks}
                            </Link>
                        ),
                    })}
                </p>
            </div>
            <AuthNav />
            <Footer classname="bg-black text-white" />
        </div>
    );
}
