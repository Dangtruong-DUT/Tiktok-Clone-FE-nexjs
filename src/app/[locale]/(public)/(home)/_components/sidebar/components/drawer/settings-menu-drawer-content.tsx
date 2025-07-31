import { useDrawerSidebar } from "@/app/[locale]/(public)/(home)/_components/sidebar/components/drawer/drawer";
import MENU_ITEMS from "@/app/[locale]/(public)/(home)/constants/more-menu-items";
import NestedMenu from "@/components/nested-menu/nested-menu";
import { MenuGroup, MenuOption } from "@/components/nested-menu/types";
import { useLocale } from "next-intl";
import { useTheme } from "next-themes";
import { useCallback } from "react";

export default function SettingsMenuDrawerContent() {
    const { toggleDrawer } = useDrawerSidebar();
    const locale = useLocale();
    const { theme } = useTheme();

    const onChange = useCallback((item: MenuOption) => {
        console.log("Selected item:", item);
    }, []);
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

    const getTitleOfGroup = useCallback((item: MenuGroup) => {
        if (item.groupKey === "language") {
            return locale == "en" ? "English" : "Tiếng Việt";
        }

        return item.title;
    }, []);

    return (
        <NestedMenu
            getTitleOfGroup={getTitleOfGroup}
            items={MENU_ITEMS}
            onChange={onChange}
            onClose={toggleDrawer}
            isChecked={setIChecked}
            title="More"
        />
    );
}
