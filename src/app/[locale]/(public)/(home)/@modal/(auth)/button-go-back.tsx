"use client";
import { ChevronLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export function GoBack() {
    const router = useRouter();
    const t = useTranslations("LoginPage");
    const handleGoBack = useCallback(() => {
        router.back();
    }, [router]);
    return (
        <button
            onClick={handleGoBack}
            className="mt-4  h-11 w-full flex items-center justify-center gap-0.5 rounded-xs cursor-pointer text-sm"
        >
            <ChevronLeft />
            {t("goBack")}
        </button>
    );
}
