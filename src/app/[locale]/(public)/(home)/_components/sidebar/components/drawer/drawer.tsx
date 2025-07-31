import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface DrawerSidebarContextProps {
    isOpen: boolean;
    toggleDrawer: () => void;
}

export const DrawerSidebarContext = createContext<DrawerSidebarContextProps | undefined>(undefined);

export const useDrawerSidebar = () => {
    const context = useContext(DrawerSidebarContext);
    if (!context) {
        throw new Error("useSidebar must be used within a DrawerSidebarProvider");
    }
    return context;
};

type DrawerSidebarProps = {
    children: React.ReactNode;
    isOpen: boolean;
    setIsOpenDrawer: (isOpen: boolean) => void;
};
export default function DrawerSidebar({ children, isOpen, setIsOpenDrawer }: DrawerSidebarProps) {
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
        <DrawerSidebarContext value={{ isOpen, toggleDrawer: handleClose }}>
            <div
                className={cn(
                    "absolute top-0 bottom-0 left-14 z-[99] transition-transform duration-300",
                    isOpen ? "animate-slide-in" : "animate-slide-out "
                )}
            >
                {/* Overlay */}
                <div
                    className="bg-transparent absolute top-0 bottom-0 left-0 w-[calc(100vw-56px-16px)] z-[1]"
                    onClick={handleClose}
                />

                {/* Content */}
                <section className="relative z-[3] bg-background w-full h-full pt-6 px-2 pb-0 flex flex-col border-r border-border">
                    {children}
                </section>
            </div>
        </DrawerSidebarContext>
    );
}
