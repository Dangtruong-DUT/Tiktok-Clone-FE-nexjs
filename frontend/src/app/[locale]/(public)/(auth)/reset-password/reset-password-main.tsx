"use client";

import ResetPasswordForm from "@/app/[locale]/(public)/(auth)/reset-password/reset-password-form";
import VerifyResetToken from "@/app/[locale]/(public)/(auth)/reset-password/verify-reset-token";
import { useTranslations } from "next-intl";
import { useState } from "react";

export default function ResetPasswordMain() {
    const [verifiedToken, setVerifiedToken] = useState<string | null>(null);
    const t = useTranslations("resetPasswordPage");

    const handleTokenVerified = (token: string) => {
        setVerifiedToken(token);
    };

    if (!verifiedToken) {
        return <VerifyResetToken onTokenVerified={handleTokenVerified} />;
    }

    return (
        <div className="w-full max-w-sm mx-auto px-4">
            <h1 className="text-3xl my-4 font-bold text-center mt-16">{t("title")}</h1>
            <ResetPasswordForm token={verifiedToken} />
        </div>
    );
}
