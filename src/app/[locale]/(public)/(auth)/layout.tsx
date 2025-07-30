import { AuthNav } from "@/app/[locale]/(public)/(auth)/auth-nav";
import AuthFooter from "@/components/auth-footer";
import AuthHeader from "@/components/auth-header";
import { LocalesType } from "@/i18n/config";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";

export default function AuthLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: LocalesType }>;
}) {
    const { locale } = use(params);
    // Enable static rendering
    setRequestLocale(locale);

    return (
        <div>
            <AuthHeader />
            <main className="bg-white text-black h-[calc(100vh-3.75rem-5.25rem-4rem)] overflow-auto">{children}</main>
            <AuthNav />
            <AuthFooter />
        </div>
    );
}
