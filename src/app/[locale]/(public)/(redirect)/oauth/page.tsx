"use client";

import { TokenPayload } from "@/types/jwt";
import { decodeJwt } from "@/utils/jwt";
import { useCallback, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { SearchParamsLoader, useSearchParamsLoader } from "@/components/searchparams-loader";
import { useSetCookieMutation } from "@/services/RTK/auth.services";
import { useAppDispatch } from "@/hooks/redux";
import { setRole, tokenReceived } from "@/store/features/authSlice";
import Loading from "@/components/lottie-icons/loading";

export default function OauthGooglePage() {
    const t = useTranslations("OauthPage");
    const router = useRouter();

    const [setCookieMutateAsync] = useSetCookieMutation();

    const { searchParams, setSearchParams } = useSearchParamsLoader();
    const access_token = searchParams?.get("access_token");
    const refresh_token = searchParams?.get("refresh_token");
    const message = searchParams?.get("message");
    const dispatch = useAppDispatch();

    const handleSetCookie = useCallback(
        async (access_token: string, refresh_token: string) => {
            try {
                await setCookieMutateAsync({
                    access_token,
                    refresh_token,
                }).unwrap();
                const { role } = decodeJwt<TokenPayload>(access_token);

                dispatch(tokenReceived({ access_token, refresh_token }));
                dispatch(setRole(role));
                router.push("/");
            } catch (error) {
                console.error("Error setting cookies:", error);
            }
        },
        [router, setCookieMutateAsync, dispatch]
    );

    useEffect(() => {
        if (access_token && refresh_token) {
            handleSetCookie(access_token, refresh_token);
        }
    }, [router, message, handleSetCookie, access_token, refresh_token, t]);

    return (
        <div className="m-auto flex flex-col items-center">
            <h1 className="text-center font-semibold text-xl">Oauth Redirecting...</h1>
            <Loading loop className="size-18" />
            <SearchParamsLoader onParamsReceived={setSearchParams} />
        </div>
    );
}
