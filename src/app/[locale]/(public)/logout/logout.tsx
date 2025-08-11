"use client";

import { SearchParamsLoader, useSearchParamsLoader } from "@/components/searchparams-loader";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { useRouter } from "@/i18n/navigation";
import { useLogoutMutation } from "@/services/RTK/auth.services";
import { setLoggedOutAction } from "@/store/features/authSlice";
import { useEffect } from "react";

export default function Logout() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { searchParams, setSearchParams } = useSearchParamsLoader();
    const accessTokenFromStore = useAppSelector((state) => state.auth.access_token);
    const refreshTokenFromStore = useAppSelector((state) => state.auth.refresh_token);
    const accessToken = searchParams?.get("accessToken");
    const refreshToken = searchParams?.get("refreshToken");
    const [logoutMutate] = useLogoutMutation();
    useEffect(() => {
        const handleLogout = async () => {
            try {
                await logoutMutate().unwrap();
            } catch (error) {
                console.error("Error logging out:", error);
            } finally {
                dispatch(setLoggedOutAction());
                router.push("/");
            }
        };
        if (
            (accessToken && accessTokenFromStore === accessToken) ||
            (refreshToken && refreshTokenFromStore === refreshToken)
        ) {
            handleLogout();
        } else {
            router.push("/");
        }
    }, [logoutMutate, accessToken, refreshToken, router, dispatch, accessTokenFromStore, refreshTokenFromStore]);
    return <SearchParamsLoader onParamsReceived={setSearchParams} />;
}
