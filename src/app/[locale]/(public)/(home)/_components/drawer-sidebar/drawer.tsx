import React, { ReactNode } from "react";

export interface DrawerSidebarProps {
    children: ReactNode;
    onClose: () => void;
}

export default function DrawerSidebar({ children, onClose }: DrawerSidebarProps) {
    return (
        <div className="absolute top-0 bottom-0 left-14 z-[99] animate-slide-in">
            {/* Overlay */}
            <div
                className="bg-transparent absolute top-0 bottom-0 left-0 w-[calc(100vw-56px-16px)] z-[1]"
                onClick={onClose}
            />

            {/* Content */}
            <section className="relative z-[3] bg-background w-full h-full pt-6 px-2 pb-0 flex flex-col border-r border-border">
                {children}
            </section>
        </div>
    );
}
