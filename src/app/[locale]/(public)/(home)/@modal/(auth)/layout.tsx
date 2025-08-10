import { LocalesType } from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AuthNav } from "@/app/[locale]/(public)/(home)/@modal/(auth)/auth-nav";
import DialogWrapper from "@/app/[locale]/(public)/(home)/@modal/(auth)/dialog-wrapper";

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
        <DialogWrapper>
            <div className="flex flex-col h-[90vh]">
                <main className="flex-1 overflow-auto">{children}</main>
                <div className="h-[4.5rem] bg-card">
                    <p className="text-xs  text-muted-foreground text-center max-w-sm mx-auto p-4" aria-live="polite">
                        {t.rich("notice", {
                            terms: (chunks) => (
                                <Link
                                    href="/terms"
                                    target="_blank"
                                    className="font-semibold hover:underline text-card-foreground"
                                >
                                    {chunks}
                                </Link>
                            ),
                            privacy: (chunks) => (
                                <Link
                                    href="/privacy"
                                    target="_blank"
                                    className="font-semibold hover:underline text-card-foreground"
                                >
                                    {chunks}
                                </Link>
                            ),
                        })}
                    </p>
                </div>
                <AuthNav />
            </div>
        </DialogWrapper>
    );
}
