import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { useRefreshTokenMutation } from "@/services/RTK/auth.services";
import { setLoggedOutAction } from "@/store/features/authSlice";
import { TokenPayload } from "@/types/jwt";
import { RefreshTokenRes } from "@/types/response/auth.type";
import { decodeJwt } from "@/utils/jwt";
import { useCallback } from "react";

interface RefreshTokenProps {
    force?: boolean;
    onSuccess?: (res: RefreshTokenRes) => void;
    onError?: (error: unknown) => void;
}

export default function useRefreshToken(props?: RefreshTokenProps) {
    const dispatch = useAppDispatch();
    const [refreshTokenMutate, refreshTokenResult] = useRefreshTokenMutation();
    const access_token = useAppSelector((state) => state.auth.access_token);
    const refresh_token = useAppSelector((state) => state.auth.refresh_token);

    const refreshToken = useCallback(async () => {
        if (access_token === null || refresh_token === null) return;
        const decodeAccessToken = decodeJwt<TokenPayload>(access_token);
        const decodeRefreshToken = decodeJwt<TokenPayload>(refresh_token);
        const currentTime = Date.now() / 1000; // Convert to seconds
        if (decodeRefreshToken.exp < currentTime) {
            return dispatch(setLoggedOutAction());
        }
        // If the access token is still valid for more than 1/3 of its lifetime, skip the refresh logic
        if (props?.force || decodeAccessToken.exp - currentTime > (decodeAccessToken.exp - decodeAccessToken.iat) / 3)
            return;

        try {
            const res = await refreshTokenMutate().unwrap();
            props?.onSuccess?.(res);
        } catch (error) {
            console.error("Failed to refresh token:", error);
            props?.onError?.(error);
        }
    }, [access_token, refresh_token, dispatch, refreshTokenMutate, props]);
    return {
        refreshTokenResult,
        refreshToken,
    };
}
