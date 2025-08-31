"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useState } from "react";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "sonner";
import { useAppDispatch } from "@/hooks/redux";
import clientSessionToken from "@/services/storage/clientSessionToken";
import { TokenPayload } from "@/types/jwt";
import { decodeJwt } from "@/utils/jwt";
import { setRole, setUserProfile, tokenReceived } from "@/store/features/authSlice";
import RefreshToken from "@/components/refresh-token";

interface AppContextType {
    authStatus: AuthStatus;
}

const AppContext = createContext<AppContextType>({
    authStatus: "loading",
});

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            staleTime: 1000 * 60 * 5,
        },
    },
});

type AuthStatus = "ready" | "loading";

export function AppProvider({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch();
    const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");

    useEffect(() => {
        const accessToken = clientSessionToken.getAccessToken();
        const refreshToken = clientSessionToken.getRefreshToken();
        const userProfile = clientSessionToken.getUserProfile();
        if (!accessToken || !refreshToken) {
            setAuthStatus("ready");
            return;
        }
        try {
            const { role } = decodeJwt<TokenPayload>(accessToken);
            dispatch(tokenReceived({ access_token: accessToken, refresh_token: refreshToken }));
            dispatch(setRole(role));
            dispatch(setUserProfile(userProfile));
        } catch (error) {
            console.error("Failed to decode JWT:", error);
        } finally {
            setAuthStatus("ready");
        }
    }, [dispatch]);

    return (
        <AppContext
            value={{
                authStatus,
            }}
        >
            <QueryClientProvider client={queryClient}>
                {children}
                <Toaster />
                <RefreshToken />
                <NextTopLoader showSpinner={false} color="var(--color-brand)" />
            </QueryClientProvider>
        </AppContext>
    );
}

export function useAppContext() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useAppContext must be used within an AppProvider");
    }
    return context;
}
