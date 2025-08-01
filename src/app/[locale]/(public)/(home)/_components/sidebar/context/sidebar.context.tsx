"use client";

import React, { createContext, useContext, useState } from "react";
export interface SidebarContextType {
    isOpenDrawer: boolean;
    setIsOpenDrawer: (isOpen: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType>({
    isOpenDrawer: false,
    setIsOpenDrawer: () => {},
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [isOpenDrawer, setIsOpenDrawer] = useState<boolean>(false);
    return <SidebarContext value={{ isOpenDrawer, setIsOpenDrawer }}>{children}</SidebarContext>;
}

export default function useSidebar() {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error("useSidebar must be used within a SidebarProvider");
    }
    return context;
}
