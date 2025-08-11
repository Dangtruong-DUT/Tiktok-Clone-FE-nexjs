"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, useEffect } from "react";

const AppContext = createContext(undefined);

import NextTopLoader from "nextjs-toploader";
import { Toaster } from "sonner";
import { useAppDispatch } from "@/hooks/redux";
import clientSessionToken from "@/services/storage/clientSessionToken";
import { TokenPayload } from "@/types/jwt";
import { decodeJwt } from "@/utils/jwt";
import { setRole, tokenReceived } from "@/store/features/authSlice";
import RefreshToken from "@/components/refresh-token";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            staleTime: 1000 * 60 * 5,
        },
    },
});
export function AppProvider({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch();

    useEffect(() => {
        const accessToken = clientSessionToken.getAccessToken();
        const refreshToken = clientSessionToken.getRefreshToken();
        if (!accessToken || !refreshToken) return;
        try {
            const { role } = decodeJwt<TokenPayload>(accessToken);
            dispatch(setRole(role));
            dispatch(tokenReceived({ access_token: accessToken, refresh_token: refreshToken }));
        } catch (error) {
            console.error("Failed to decode JWT:", error);
        }
    }, [dispatch]);

    return (
        <AppContext value={undefined}>
            <QueryClientProvider client={queryClient}>
                {children}
                <Toaster />
                <RefreshToken />
                <NextTopLoader showSpinner={false} color="var(--color-brand)" />
            </QueryClientProvider>
        </AppContext>
    );
}
