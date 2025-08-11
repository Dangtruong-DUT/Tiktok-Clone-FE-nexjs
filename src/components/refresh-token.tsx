"use client ";

import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { usePathname, useRouter } from "@/i18n/navigation";
import { handleRefreshToken } from "@/lib/auth";
import { useLogoutMutation } from "@/services/RTK/auth.services";
import { RootState } from "@/store";
import { tokenReceived } from "@/store/features/authSlice";
import { TokenPayload } from "@/types/jwt";
import { decodeJwt } from "@/utils/jwt";
import { useCallback, useEffect, useRef } from "react";

const EXCLUDE_PATHS = ["/login", "/register", "/logout", "/refresh-token", "/oauth"];
export default function RefreshToken() {
    const refreshTokenFromStore = useAppSelector((state: RootState) => state.auth.refresh_token);
    const accessTokenFromStore = useAppSelector((state: RootState) => state.auth.access_token);
    const dispatch = useAppDispatch();
    const timer = useRef<NodeJS.Timeout | null>(null);
    const pathname = usePathname();
    const isRefreshing = useRef(false);
    const [logoutMutate] = useLogoutMutation();
    const router = useRouter();

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

    const doRefresh = useCallback(async () => {
        if (isRefreshing.current) return;
        isRefreshing.current = true;
        try {
            await refreshToken();
        } finally {
            isRefreshing.current = false;
        }
    }, [refreshToken]);

    useEffect(() => {
        if (!refreshTokenFromStore || !accessTokenFromStore) return;
        if (EXCLUDE_PATHS.some((path) => pathname.startsWith(path))) return;
        const decodeAccessToken = decodeJwt<TokenPayload>(accessTokenFromStore);
        const INTERVAL_TIME = ((decodeAccessToken.exp - decodeAccessToken.iat) / 2) * 1000;
        doRefresh();
        timer.current = setInterval(doRefresh, Math.max(INTERVAL_TIME, 1000 * 30));

        return () => {
            if (timer.current) clearInterval(timer.current);
        };
    }, [refreshTokenFromStore, refreshToken, doRefresh, accessTokenFromStore, pathname]);

    return null;
    return null;
}
