import React, { createContext, useCallback, useContext, useState } from "react";
export interface SidebarContextType {
    isOpenDrawer: boolean;
    toggleDrawer: (isOpen: boolean) => void;
    searchValue: string;
    setSearchValue: (value: string) => void;
}

const SidebarContext = createContext<SidebarContextType>({
    isOpenDrawer: false,
    toggleDrawer: () => {},
    searchValue: "",
    setSearchValue: () => {},
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [isOpenDrawer, setIsOpenDrawer] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const toggleDrawer = useCallback((isOpen: boolean) => {
        setIsOpenDrawer(isOpen);
    }, []);
    return (
        <SidebarContext value={{ isOpenDrawer, toggleDrawer, searchValue, setSearchValue }}>{children}</SidebarContext>
    );
}

export default function useSidebar() {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error("useSidebar must be used within a SidebarProvider");
    }
    return context;
}
