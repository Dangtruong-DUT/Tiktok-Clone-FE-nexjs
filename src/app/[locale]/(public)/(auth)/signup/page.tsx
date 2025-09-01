"use client";

import { MenuItemsList } from "@/app/[locale]/(public)/(auth)/menu-items";
import { useTranslations } from "next-intl";

export default function SignUpPage() {
    const t = useTranslations("SignUpPage");
    return (
        <div>
            <h1 className="text-2xl font-bold text-center mb-4 mt-16">{t("title")}</h1>
            <p className="text-center text-base text-neutral-500 mb-5">{t("description")}</p>
            <MenuItemsList type="signup" />
        </div>
    );
}
