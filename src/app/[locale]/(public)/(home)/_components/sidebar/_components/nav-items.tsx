"use client";

import {
    HOME_MENU_ITEMS,
    MenuItemConfig,
} from "@/app/[locale]/(public)/(home)/_components/sidebar/_config/menu-items-sidebar.config";
import useSidebar from "@/app/[locale]/(public)/(home)/_components/sidebar/_context/sidebar.context";
import { routeToActiveType } from "@/app/[locale]/(public)/(home)/_components/sidebar/_types/sidebar.types";
import { Role } from "@/constants/enum";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useCallback } from "react";

interface NavItemsProps {
    roleUser: Role | null;
}

export default function NavItems({ roleUser }: NavItemsProps) {
    const { isOpenDrawer, activeState, setActiveState } = useSidebar();
    const t = useTranslations();

    const handleClickNavItem = useCallback(
        (item: MenuItemConfig) => {
            setActiveState({ type: routeToActiveType[item.to], route: item.to });
        },
        [setActiveState]
    );

    return (
        <nav className="flex flex-col gap-[0.5rem] ">
            {HOME_MENU_ITEMS.map((item, index) => {
                const expectedActiveType = routeToActiveType[item.to];
                const isActive = activeState.type === expectedActiveType;
                const IconComponent = isActive && item.ActiveIcon ? item.ActiveIcon : item.Icon;
                if (roleUser == null && item.viewFor === "authenticated") {
                    return null;
                }

                return (
                    <Link
                        key={index}
                        className={cn(
                            "flex items-center h-10 px-2 gap-3 rounded-lg transition-all duration-200 hover:bg-accent"
                        )}
                        href={item.to}
                        onClick={() => handleClickNavItem(item)}
                    >
                        <IconComponent
                            size={24}
                            className={cn(
                                "transition-colors duration-200",
                                isActive ? "text-brand" : "text-foreground"
                            )}
                        />
                        {!isOpenDrawer && (
                            <h2
                                className={cn(
                                    "text-base font-medium transition-colors duration-200",
                                    isActive ? "text-brand" : "text-foreground"
                                )}
                            >
                                {t(item.titleKey)}
                            </h2>
                        )}
                    </Link>
                );
            })}
        </nav>
    );
}
