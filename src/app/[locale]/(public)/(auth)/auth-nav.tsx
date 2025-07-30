"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

export function AuthNav() {
    const pathname = usePathname();
    const isLoginPage = pathname.includes("/login");
    const t = useTranslations("AuthLayout");

    return (
        <section
            className="h-16 bg-white text-black flex gap-0.5 items-center justify-center"
            aria-label="Auth navigation"
        >
            <p className="text-center text-sm font-light" aria-live="polite">
                {!isLoginPage ? t("haveAccount") : t("noAccount")}
            </p>
            <Link href={isLoginPage ? "/signup" : "/login"} className="text-sm font-bold text-brand">
                {!isLoginPage ? t("login") : t("signUp")}
            </Link>
        </section>
    );
}
