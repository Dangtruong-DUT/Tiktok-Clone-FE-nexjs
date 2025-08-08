"use client";

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";
import { SidebarActiveType, SidebarActiveState, routeToActiveType } from "../_types/sidebar.types";
import { usePathname } from "@/i18n/navigation";

export interface SidebarContextType {
    isOpenDrawer: boolean;
    setIsOpenDrawer: (isOpen: boolean) => void;
    activeState: SidebarActiveState;
    setActiveState: (state: SidebarActiveState) => void;
    resetToRouteActive: () => void;
}

const SidebarContext = createContext<SidebarContextType>({
    isOpenDrawer: false,
    setIsOpenDrawer: () => {},
    activeState: { type: SidebarActiveType.NONE },
    setActiveState: () => {},
    resetToRouteActive: () => {},
});

const getCurrentActiveStateFromPathname = (pathname: string): SidebarActiveState => {
    if (pathname in routeToActiveType) {
        return {
            type: routeToActiveType[pathname as keyof typeof routeToActiveType],
        };
    }

    return { type: SidebarActiveType.NONE };
};

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [isOpenDrawer, setIsOpenDrawer] = useState<boolean>(false);
    const [activeState, setActiveState] = useState<SidebarActiveState>({ type: SidebarActiveType.NONE });
    const activeOldStateRef = useRef<SidebarActiveState | null>(null);
    const pathname = usePathname();

    useEffect(() => {
        if (pathname && activeState.type === SidebarActiveType.NONE && activeOldStateRef.current === null) {
            setActiveState(getCurrentActiveStateFromPathname(pathname));
            activeOldStateRef.current = { type: SidebarActiveType.NONE };
        }
    }, [pathname, activeState]);

    const resetToRouteActive = useCallback(() => {
        if (activeState.type) {
            setActiveState(activeOldStateRef.current || { type: SidebarActiveType.NONE });
        }
    }, [activeState]);

    const handleSetActiveState = useCallback(
        (state: SidebarActiveState) => {
            if (state.type === SidebarActiveType.SEARCH || state.type === SidebarActiveType.MORE) {
                activeOldStateRef.current = activeState;
            }
            setActiveState(state);
        },
        [activeState]
    );

    return (
        <SidebarContext.Provider
            value={{
                isOpenDrawer,
                setIsOpenDrawer,
                activeState,
                setActiveState: handleSetActiveState,
                resetToRouteActive,
            }}
        >
            {children}
        </SidebarContext.Provider>
    );
}

export default function useSidebar() {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error("useSidebar must be used within a SidebarProvider");
    }
    return context;
}
