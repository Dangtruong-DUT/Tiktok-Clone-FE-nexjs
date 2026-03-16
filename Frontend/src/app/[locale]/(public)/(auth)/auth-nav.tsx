"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

export function AuthNav() {
    const pathname = usePathname();
    const isLoginPage = pathname.includes("/login");
    const t = useTranslations("AuthLayout");

    return (
        <aside
            className="h-16 bg-white text-black flex gap-1 items-center justify-center border-t-1 border-neutral-200"
            aria-label="Auth navigation"
        >
            <p className="text-center text-sm font-semibold  tracking-wide" aria-live="polite">
                {!isLoginPage ? t("haveAccount") : t("noAccount")}
            </p>
            <Link
                href={isLoginPage ? "/signup" : "/login"}
                className="text-sm font-semibold text-brand hover:underline"
            >
                {!isLoginPage ? t("login") : t("signUp")}
            </Link>
        </aside>
    );
}
