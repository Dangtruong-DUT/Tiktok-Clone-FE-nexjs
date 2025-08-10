"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useState } from "react";

export type OpenModalVideoDetailType = "comments" | "modalVideoDetail" | null;

interface AppContextProps {
    openModalVideoDetailType: OpenModalVideoDetailType;
    setOpenModalVideoDetailType: (type: OpenModalVideoDetailType) => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

import NextTopLoader from "nextjs-toploader";
import { Toaster } from "sonner";
import { useAppDispatch } from "@/hooks/redux";
import clientSessionToken from "@/services/storage/clientSessionToken";
import { TokenPayload } from "@/types/jwt";
import { decodeJwt } from "@/utils/jwt";
import { setRole, tokenReceived } from "@/store/features/authSlice";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            staleTime: 1000 * 60 * 5,
        },
    },
});
export function AppProvider({ children }: { children: React.ReactNode }) {
    const [openModalVideoDetailType, setOpenModalVideoDetailType] = useState<OpenModalVideoDetailType>(null);

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
        <AppContext value={{ openModalVideoDetailType, setOpenModalVideoDetailType }}>
            <QueryClientProvider client={queryClient}>
                {children}
                <Toaster />
                <NextTopLoader showSpinner={false} color="var(--color-brand)" />
            </QueryClientProvider>
        </AppContext>
    );
}

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useAppContext must be used within an AppProvider");
    }
    return context;
};
