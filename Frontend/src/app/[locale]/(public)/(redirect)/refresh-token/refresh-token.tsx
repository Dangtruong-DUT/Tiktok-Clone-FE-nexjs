"use client";

import { SearchParamsLoader, useSearchParamsLoader } from "@/components/searchparams-loader";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { handleRefreshToken } from "@/lib/auth";
import { useLogoutMutation } from "@/services/RTK/auth.services";
import { tokenReceived } from "@/store/features/authSlice";
//must next navigation, redirect form server: /locale/endpoint
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";

export default function RefreshToken() {
    const refreshTokenFormStore = useAppSelector((state) => state.auth.refresh_token);
    const { searchParams, setSearchParams } = useSearchParamsLoader();
    const refreshTokenQuery = searchParams?.get("refreshToken");
    const redirectQuery = searchParams?.get("redirect");
    const [logoutMutate] = useLogoutMutation();
    const router = useRouter();
    const dispatch = useAppDispatch();

    const handleLogout = useCallback(async () => {
        try {
            await logoutMutate();
            router.push("/");
        } catch (error) {
            console.error("Error logging out:", error);
        }
    }, [logoutMutate, router]);

    const refreshToken = useCallback(async () => {
        await handleRefreshToken({
            onSuccess: (data) => {
                const { access_token, refresh_token } = data.data;
                dispatch(tokenReceived({ access_token, refresh_token }));
            },
            onError: async () => {
                try {
                    await logoutMutate().unwrap();
                } catch (error) {
                    console.error("Error logging out:", error);
                } finally {
                    router.push("/");
                }
            },
        });
    }, [dispatch, logoutMutate, router]);

    useEffect(() => {
        if (refreshTokenFormStore && refreshTokenQuery === refreshTokenFormStore && refreshToken) {
            refreshToken();
        } else if (refreshTokenFormStore == null && refreshTokenQuery != null) {
            handleLogout();
        } else {
            router.push("/");
        }
    }, [refreshToken, refreshTokenQuery, redirectQuery, refreshTokenFormStore, router, handleLogout]);
    return <SearchParamsLoader onParamsReceived={setSearchParams} />;
}
