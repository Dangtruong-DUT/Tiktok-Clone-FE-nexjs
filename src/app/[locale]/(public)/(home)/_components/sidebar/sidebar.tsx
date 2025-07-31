"use client";

import { cn } from "@/lib/utils";
import CallToAction from "@/app/[locale]/(public)/(home)/_components/sidebar/components/call-to-action";
import SidebarHeader from "@/app/[locale]/(public)/(home)/_components/sidebar/components/sidebar-header";
import SidebarFooter from "@/app/[locale]/(public)/(home)/_components/sidebar/components/SidebarFooter";

import NavItems from "@/app/[locale]/(public)/(home)/_components/sidebar/components/nav-items";
import useSidebar, {
    SidebarProvider,
} from "@/app/[locale]/(public)/(home)/_components/sidebar/context/sidebar.context";

export interface SidebarProps {
    className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
    const { isOpenDrawer } = useSidebar();

    return (
        <SidebarProvider>
            <div
                className={cn(
                    "relative h-screen transition-all duration-400 ease-in-out px-4",
                    { "w-14 border-r border-border": isOpenDrawer, "w-60": !isOpenDrawer },
                    className
                )}
            >
                <aside
                    className={cn(
                        "flex flex-col w-full py-5 px-0 pb-[26px] h-full flex-shrink-0",
                        "transition-all duration-400 ease-in-out",
                        isOpenDrawer && "w-14 border-r border-border"
                    )}
                >
                    <SidebarHeader />

                    <div className={cn("flex-shrink-0 flex-1 overflow-hidden overflow-y-auto scrollbar-hidden")}>
                        <NavItems />

                        {!isOpenDrawer && (
                            <>
                                <CallToAction />
                                <SidebarFooter />
                            </>
                        )}
                    </div>
                </aside>
            </div>
        </SidebarProvider>
    );
}
