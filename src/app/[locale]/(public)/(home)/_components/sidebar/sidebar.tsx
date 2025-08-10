"use client";

import { cn } from "@/lib/utils";
import CallToAction from "@/app/[locale]/(public)/(home)/_components/sidebar/_components/call-to-action";
import SidebarHeader from "@/app/[locale]/(public)/(home)/_components/sidebar/_components/sidebar-header";
import SidebarFooter from "@/app/[locale]/(public)/(home)/_components/sidebar/_components/SidebarFooter";

import NavItems from "@/app/[locale]/(public)/(home)/_components/sidebar/_components/nav-items";
import useSidebar from "@/app/[locale]/(public)/(home)/_components/sidebar/_context/sidebar.context";
import { SidebarActiveType } from "@/app/[locale]/(public)/(home)/_components/sidebar/_types/sidebar.types";
import { useCallback, useEffect, useState } from "react";
import SearchDrawerContent from "@/app/[locale]/(public)/(home)/_components/sidebar/_components/drawer/search-drawer-content";
import DrawerSidebar from "@/app/[locale]/(public)/(home)/_components/sidebar/_components/drawer/drawer";
import SettingsMenuDrawerContent from "@/app/[locale]/(public)/(home)/_components/sidebar/_components/drawer/settings-menu-drawer-content";
import { MoreHorizontalIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { FaRegUser, FaUser } from "react-icons/fa6";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

export interface SidebarProps {
    className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
    const { isOpenDrawer, setIsOpenDrawer, activeState, setActiveState, resetToRouteActive } = useSidebar();
    const [isOpenSearch, setIsOpenSearch] = useState<boolean>(false);
    const [isOpenSettings, setIsOpenSettings] = useState<boolean>(false);
    const [searchValue, setSearchValue] = useState<string>("");
    const role = useSelector((state: RootState) => state.auth.role);
    const isAuth = role !== null;

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
            resetToRouteActive();
        } else {
            setIsOpenDrawer(true);
            setActiveState({ type: SidebarActiveType.SEARCH });
        }
        setIsOpenSearch((prev) => !prev);
    }, [isOpenSearch, setIsOpenSearch, setIsOpenDrawer, setActiveState, resetToRouteActive]);

    const toggleSettingsDrawer = useCallback(() => {
        if (isOpenSettings) {
            setIsOpenDrawer(false);
            resetToRouteActive();
        } else {
            setIsOpenDrawer(true);
            setActiveState({ type: SidebarActiveType.MORE });
        }
        setIsOpenSettings((prev) => !prev);
    }, [isOpenSettings, setIsOpenDrawer, setIsOpenSettings, setActiveState, resetToRouteActive]);

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

                <div
                    className={cn(
                        "flex-shrink-0 flex-1 overflow-hidden overflow-y-auto scrollbar-hidden",
                        { "w-full": !isOpenDrawer },
                        { "w-10": isOpenDrawer }
                    )}
                >
                    <NavItems roleUser={role} />
                    <div className="flex flex-col gap-[0.5rem]">
                        <Link
                            href="/@dangtruong"
                            className={cn(
                                "flex items-center h-10 px-2 gap-3 rounded-lg transition-all duration-200 hover:bg-accent",
                                activeState.type === SidebarActiveType.PROFILE && "bg-accent"
                            )}
                            onClick={() => setActiveState({ type: SidebarActiveType.PROFILE, route: "/@dangtruong" })}
                        >
                            {activeState.type === SidebarActiveType.PROFILE ? (
                                <FaUser size={22} className="transition-colors  text-brand" />
                            ) : (
                                <FaRegUser size={22} className="transition-colors  text-foreground" />
                            )}

                            {!isOpenDrawer && (
                                <h2
                                    className={cn(
                                        "text-base font-medium transition-colors duration-200",
                                        activeState.type === SidebarActiveType.PROFILE
                                            ? "text-brand"
                                            : "text-foreground"
                                    )}
                                >
                                    {t("profile")}
                                </h2>
                            )}
                        </Link>
                        <button
                            className={cn(
                                "flex items-center h-10 px-2 gap-3 rounded-lg transition-all duration-200 hover:bg-accent",
                                activeState.type === SidebarActiveType.MORE && "bg-accent"
                            )}
                            onClick={toggleSettingsDrawer}
                        >
                            <MoreHorizontalIcon
                                size={24}
                                className={cn(
                                    "transition-colors duration-200",
                                    activeState.type === SidebarActiveType.MORE ? "text-brand" : "text-foreground"
                                )}
                            />
                            {!isOpenDrawer && (
                                <h2
                                    className={cn(
                                        "text-base font-medium transition-colors duration-200",
                                        activeState.type === SidebarActiveType.MORE ? "text-brand" : "text-foreground"
                                    )}
                                >
                                    {t("more")}
                                </h2>
                            )}
                        </button>
                    </div>

                    {!isOpenDrawer && (
                        <>
                            <CallToAction isAuth={isAuth} />
                            <SidebarFooter />
                        </>
                    )}
                </div>
            </aside>
        </div>
    );
}
