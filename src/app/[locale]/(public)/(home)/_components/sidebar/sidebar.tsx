"use client";

import { cn } from "@/lib/utils";
import CallToAction from "@/app/[locale]/(public)/(home)/_components/sidebar/components/call-to-action";
import SidebarHeader from "@/app/[locale]/(public)/(home)/_components/sidebar/components/sidebar-header";
import SidebarFooter from "@/app/[locale]/(public)/(home)/_components/sidebar/components/SidebarFooter";

import NavItems from "@/app/[locale]/(public)/(home)/_components/sidebar/components/nav-items";
import useSidebar from "@/app/[locale]/(public)/(home)/_components/sidebar/context/sidebar.context";
import { useCallback, useEffect, useState } from "react";
import SearchDrawerContent from "@/app/[locale]/(public)/(home)/_components/sidebar/components/drawer/search-drawer-content";
import DrawerSidebar from "@/app/[locale]/(public)/(home)/_components/sidebar/components/drawer/drawer";
import SettingsMenuDrawerContent from "@/app/[locale]/(public)/(home)/_components/sidebar/components/drawer/settings-menu-drawer-content";
import { MoreHorizontalIcon, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";

export interface SidebarProps {
    className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
    const { isOpenDrawer, setIsOpenDrawer } = useSidebar();
    const [isOpenSearch, setIsOpenSearch] = useState<boolean>(false);
    const [isOpenSettings, setIsOpenSettings] = useState<boolean>(false);
    const [searchValue, setSearchValue] = useState<string>("");

    const t = useTranslations("HomePage.menu");

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
    }, [isOpenSearch, setIsOpenSearch, setIsOpenDrawer]);

    const toggleSettingsDrawer = useCallback(() => {
        if (isOpenSettings) {
            setIsOpenDrawer(false);
        } else {
            setIsOpenDrawer(true);
        }
        setIsOpenSettings((prev) => !prev);
    }, [isOpenSettings, setIsOpenDrawer, setIsOpenSettings]);

    return (
        <div className={cn("relative h-screen transition-all duration-400 ease-in-out px-4", "w-60", className)}>
            <DrawerSidebar isOpen={isOpenSearch} setIsOpenDrawer={toggleSearchDrawer}>
                <SearchDrawerContent searchValue={searchValue} setSearchValue={setSearchValue} />
            </DrawerSidebar>
            <DrawerSidebar isOpen={isOpenSettings} setIsOpenDrawer={toggleSettingsDrawer}>
                <SettingsMenuDrawerContent />
            </DrawerSidebar>
            <aside
                className={cn(
                    "flex flex-col w-full py-5 px-0 pb-[26px] h-full flex-shrink-0",
                    "transition-all duration-400 ease-in-out"
                )}
            >
                <SidebarHeader
                    isOpenSearch={isOpenDrawer || isOpenSearch}
                    searchValue={searchValue}
                    toggleSearchDrawer={toggleSearchDrawer}
                />

                <div className={cn("flex-shrink-0 flex-1 overflow-hidden overflow-y-auto scrollbar-hidden")}>
                    <NavItems />
                    <div className="flex flex-col gap-[0.5rem]">
                        <button className="flex items-center h-10 px-2 gap-3 rounded-lg transition-all duration-200 hover:bg-accent">
                            <UserRound size={24} className="transition-colors duration-200 text-foreground" />
                            {!isOpenDrawer && (
                                <h2 className={cn("text-base font-medium transition-colors duration-200")}>
                                    {t("profile")}
                                </h2>
                            )}
                        </button>
                        <button
                            className="flex items-center h-10 px-2 gap-3 rounded-lg transition-all duration-200 hover:bg-accent"
                            onClick={toggleSettingsDrawer}
                        >
                            <MoreHorizontalIcon size={24} className="transition-colors duration-200 text-foreground" />
                            {!isOpenDrawer && (
                                <h2 className={cn("text-base font-medium transition-colors duration-200")}>
                                    {t("more")}
                                </h2>
                            )}
                        </button>
                    </div>

                    {!isOpenDrawer && (
                        <>
                            <CallToAction />
                            <SidebarFooter />
                        </>
                    )}
                </div>
            </aside>
        </div>
    );
}
