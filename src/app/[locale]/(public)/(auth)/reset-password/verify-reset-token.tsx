"use client";

import Loading from "@/components/lottie-icons/loading";
import { SearchParamsLoader, useSearchParamsLoader } from "@/components/searchparams-loader";
import { useVerifyForgotPasswordMutation } from "@/services/RTK/user.services";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

interface VerifyResetTokenProps {
    onTokenVerified: (token: string) => void;
}

export default function VerifyResetToken({ onTokenVerified }: VerifyResetTokenProps) {
    const t = useTranslations("resetPasswordPage");
    const { searchParams, setSearchParams } = useSearchParamsLoader();

    const [verifyForgotPasswordMutate] = useVerifyForgotPasswordMutation();
    const [verifyStatus, setVerifyStatus] = useState<"loading" | "error">("loading");

    const token = searchParams?.get("token");

    const handleVerifyToken = useCallback(
        async (token: string) => {
            try {
                await verifyForgotPasswordMutate({ forgot_password_token: token }).unwrap();
                onTokenVerified(token);
            } catch (error) {
                console.error("Error verifying reset password token:", error);
                setVerifyStatus("error");
            }
        },
        [verifyForgotPasswordMutate, onTokenVerified]
    );

    useEffect(() => {
        if (token) {
            handleVerifyToken(token);
        }
    }, [token, handleVerifyToken]);

    // Loading state
    if (verifyStatus === "loading") {
        return (
            <div className="w-full max-w-sm mx-auto px-4 text-center">
                <div className="mt-16 mb-8">
                    <div className="size-35 flex items-center justify-center mx-auto mb-4">
                        <Loading loop className="size-18" />
                    </div>
                    <h1 className="text-2xl my-4 font-bold text-center">{t("verifying")}</h1>
                </div>
                <SearchParamsLoader onParamsReceived={setSearchParams} />
            </div>
        );
    }

    // Error state
    return (
        <div className="w-full max-w-sm mx-auto px-4 text-center">
            <div className="mt-16 mb-8">
                <h1 className="text-2xl my-4 font-bold text-center text-red-600">{t("invalidToken")}</h1>
                <p className="text-gray-600 text-sm mb-6">{t("invalidTokenDescription")}</p>
            </div>
            <SearchParamsLoader onParamsReceived={setSearchParams} />
        </div>
    );
}
