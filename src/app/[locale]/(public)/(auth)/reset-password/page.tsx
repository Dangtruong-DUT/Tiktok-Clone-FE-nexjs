"use client";

import ResetPasswordForm from "@/app/[locale]/(public)/(auth)/reset-password/reset-password-form";
import VerifyResetToken from "@/app/[locale]/(public)/(auth)/reset-password/verify-reset-token";
import { useState } from "react";

export default function ResetPasswordPage() {
    const [verifiedToken, setVerifiedToken] = useState<string | null>(null);

    const handleTokenVerified = (token: string) => {
        setVerifiedToken(token);
    };

    // Show verification component if token not verified yet
    if (!verifiedToken) {
        return <VerifyResetToken onTokenVerified={handleTokenVerified} />;
    }

    // Show reset form after token is verified
    return (
        <div className="w-full max-w-sm mx-auto px-4">
            <h1 className="text-3xl my-4 font-bold text-center mt-16">Reset password</h1>
            <ResetPasswordForm token={verifiedToken} />
        </div>
    );
}
