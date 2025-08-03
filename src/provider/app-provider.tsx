"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, useContext } from "react";
const AppContext = createContext({});
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
    return (
        <AppContext value={{}}>
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
