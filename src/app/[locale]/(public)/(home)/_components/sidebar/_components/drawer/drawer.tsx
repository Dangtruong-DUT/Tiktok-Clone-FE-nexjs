"use client";

import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DrawerSidebarContextProps {
    isOpen: boolean;
    toggleDrawer: () => void;
}

const DrawerSidebarContext = createContext<DrawerSidebarContextProps | undefined>(undefined);

export const useDrawerSidebar = () => {
    const context = useContext(DrawerSidebarContext);
    if (!context) {
        throw new Error("useSidebar must be used within a DrawerSidebarProvider");
    }
    return context;
};

type DrawerSidebarProps = {
    children: ReactNode;
    isOpen: boolean;
    setIsOpenDrawer: (open: boolean) => void;

    drawerWidth?: string; // ví dụ: "300px"
    leftOffset?: string; // ví dụ: "72px"
    zIndex?: string | number; // ví dụ: 99
    padding?: string; // ví dụ: "pt-6 px-2 pb-0"
};

export default function DrawerSidebar({
    children,
    isOpen,
    setIsOpenDrawer,
    drawerWidth = "20rem",
    leftOffset = "4.5rem",
    zIndex = 10,
    padding = "pt-6 px-2 pb-0",
}: DrawerSidebarProps) {
    const [isVisible, setIsVisible] = useState(isOpen);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            const timeout = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timeout);
        }
    }, [isOpen]);

    const handleClose = useCallback(() => {
        setIsOpenDrawer(false);
    }, [setIsOpenDrawer]);

    if (!isVisible) return null;

    return (
        <DrawerSidebarContext.Provider value={{ isOpen, toggleDrawer: handleClose }}>
            <div
                className={cn(
                    "absolute top-0 bottom-0 transition-[width]  ease-in-out duration-300 ",
                    isOpen ? "animate-slide-in" : "animate-slide-out"
                )}
                style={
                    {
                        left: leftOffset,
                        zIndex: Number(zIndex),
                        width: drawerWidth,
                        "--target-width": drawerWidth,
                    } as React.CSSProperties
                }
            >
                {/* Overlay */}
                <div
                    className="bg-transparent absolute top-0 bottom-0 left-0"
                    style={{ width: `calc(100vw - ${leftOffset})` }}
                    onClick={handleClose}
                />

                {/* Content */}
                <section
                    className={cn("relative bg-background w-full h-full flex flex-col border-x border-border", padding)}
                >
                    {children}
                </section>
            </div>
        </DrawerSidebarContext.Provider>
    );
}
