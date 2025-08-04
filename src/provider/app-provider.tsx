"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, useContext, useState } from "react";

interface AppContextProps {
    isOpenVideoComments: boolean;
    setIsOpenVideoComments: (isOpen: boolean) => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

import NextTopLoader from "nextjs-toploader";
import { Toaster } from "sonner";
import { useRouter } from "@/i18n/navigation";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            staleTime: 1000 * 60 * 5,
        },
    },
});
export function AppProvider({ children }: { children: React.ReactNode }) {
    const [isOpenVideoComments, setIsOpenVideoComments] = useState(false);
    const router = useRouter();
    const handleChangeOpenVideoComments = (isOpen: boolean) => {
        if (isOpen) {
            setIsOpenVideoComments(true);
        } else {
            setIsOpenVideoComments(false);
            router.back();
        }
    };

    return (
        <AppContext value={{ isOpenVideoComments, setIsOpenVideoComments: handleChangeOpenVideoComments }}>
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
