"use client";

import { cn } from "@/lib/utils";
import CallToAction from "@/app/[locale]/(public)/(home)/_components/sidebar/components/call-to-action";
import SidebarHeader from "@/app/[locale]/(public)/(home)/_components/sidebar/components/sidebar-header";
import SidebarFooter from "@/app/[locale]/(public)/(home)/_components/sidebar/components/SidebarFooter";

import NavItems from "@/app/[locale]/(public)/(home)/_components/sidebar/components/nav-items";
import useSidebar, {
    SidebarProvider,
} from "@/app/[locale]/(public)/(home)/_components/sidebar/context/sidebar.context";
import { useCallback, useEffect, useState } from "react";
import SearchDrawerContent from "@/app/[locale]/(public)/(home)/_components/sidebar/components/drawer/search-drawer-content";
import DrawerSidebar from "@/app/[locale]/(public)/(home)/_components/sidebar/components/drawer/drawer";
import SettingsMenuDrawerContent from "@/app/[locale]/(public)/(home)/_components/sidebar/components/drawer/settings-menu-drawer-content";

export interface SidebarProps {
    className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
    const { isOpenDrawer, setIsOpenDrawer } = useSidebar();
    const [isOpenSearch, setIsOpenSearch] = useState<boolean>(false);
    const [isOpenSettings, setIsOpenSettings] = useState<boolean>(false);
    const [searchValue, setSearchValue] = useState<string>("");

    useEffect(() => {
        if (isOpenDrawer === false) {
            setIsOpenSearch(false);
            setIsOpenSettings(false);
        }
    }, [isOpenDrawer]);

    const toggleSearchDrawer = useCallback(() => {
        if (isOpenSearch) {
            setIsOpenDrawer(false);
        } else {
            setIsOpenDrawer(true);
        }
        setIsOpenSearch((prev) => !prev);
    }, [isOpenSearch, setIsOpenSearch]);

    const toggleSettingsDrawer = useCallback(() => {
        if (isOpenSettings) {
            setIsOpenDrawer(false);
        } else {
            setIsOpenDrawer(true);
        }
        setIsOpenSettings((prev) => !prev);
    }, [isOpenSettings, setIsOpenDrawer, setIsOpenSettings]);

    return (
        <SidebarProvider>
            <div
                className={cn(
                    "relative h-screen transition-all duration-400 ease-in-out px-4",
                    { "w-14 border-r border-border": isOpenDrawer, "w-60": !isOpenDrawer },
                    className
                )}
            >
                <DrawerSidebar isOpen={isOpenSearch} setIsOpenDrawer={setIsOpenSearch}>
                    <SearchDrawerContent searchValue={searchValue} setSearchValue={setSearchValue} />
                </DrawerSidebar>
                <DrawerSidebar isOpen={isOpenSettings} setIsOpenDrawer={setIsOpenSettings}>
                    <SettingsMenuDrawerContent />
                </DrawerSidebar>
                <aside
                    className={cn(
                        "flex flex-col w-full py-5 px-0 pb-[26px] h-full flex-shrink-0",
                        "transition-all duration-400 ease-in-out",
                        isOpenDrawer && "w-14 border-r border-border"
                    )}
                >
                    <SidebarHeader isOpenSearch={isOpenSearch} toggleSearchDrawer={toggleSearchDrawer} />

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
