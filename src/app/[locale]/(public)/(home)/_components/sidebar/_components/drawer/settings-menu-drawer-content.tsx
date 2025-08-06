import { useDrawerSidebar } from "@/app/[locale]/(public)/(home)/_components/sidebar/_components/drawer/drawer";
import MENU_ITEMS from "@/app/[locale]/(public)/(home)/_components/sidebar/_config/more-menu-items.config";
import NestedMenu from "@/components/nested-menu/nested-menu";
import { MenuGroup, MenuOption } from "@/components/nested-menu/types";
import useLanguage from "@/hooks/shared/useLanguage";
import { useLocale } from "next-intl";
import { useTheme } from "next-themes";
import { useCallback } from "react";

export default function SettingsMenuDrawerContent() {
    const { toggleDrawer } = useDrawerSidebar();
    const locale = useLocale();
    const { onChange: changeLanguage } = useLanguage();
    const { theme, setTheme } = useTheme();

    const onChange = useCallback(
        (item: MenuOption) => {
            console.log("Selected item:", item);
            if (item.type === "item" && item.key === "language") {
                return changeLanguage(item.value as string);
            }
            if (item.type === "item" && item.key === "theme") {
                return setTheme(item.value as string);
            }
        },
        [changeLanguage, setTheme]
    );

    const setIChecked = useCallback(
        (item: MenuOption) => {
            if (item.type === "item" && item.key === "language") {
                return item.value === locale;
            }
            if (item.type === "item" && item.key === "theme") {
                return item.value === theme;
            }
            return false;
        },
        [locale, theme]
    );

    const getTitleOfGroup = useCallback(
        (item: MenuGroup) => {
            if (item.groupKey === "language") {
                return locale == "en" ? "English" : "Tiếng Việt";
            }

            return item.title;
        },
        [locale]
    );

    return (
        <NestedMenu
            getTitleOfGroup={getTitleOfGroup}
            items={MENU_ITEMS}
            onChange={onChange}
            onClose={toggleDrawer}
            isChecked={setIChecked}
            titleKeyI18n="menuMore.title"
            for="guest"
        />
    );
}
