"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, useContext, useState } from "react";

export type OpenModalVideoDetailType = "comments" | "modalVideoDetail" | null;

interface AppContextProps {
    openModalVideoDetailType: OpenModalVideoDetailType;
    setOpenModalVideoDetailType: (type: OpenModalVideoDetailType) => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

import NextTopLoader from "nextjs-toploader";
import { Toaster } from "sonner";

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
