import useSidebar from "@/app/[locale]/(public)/(home)/_components/sidebar/context/sidebar.context";
import MENU_ITEMS from "@/app/[locale]/(public)/(home)/constants/more-menu-items";
import NestedMenu from "@/components/nested-menu/nested-menu";
import { MenuOption } from "@/components/nested-menu/types";
import { useLocale } from "next-intl";
import { useTheme } from "next-themes";
import { useCallback } from "react";

export default function SettingsMenuDrawerContent() {
    const { toggleDrawer } = useSidebar();
    const locale = useLocale();
    const { theme } = useTheme();

    const handleClose = useCallback(() => {
        toggleDrawer(false);
    }, [toggleDrawer]);

    const onChange = useCallback((item: MenuOption) => {
        console.log("Selected item:", item);
    }, []);

    return (
        <NestedMenu
            getTitleOfGroup={(group) => group.title}
            items={MENU_ITEMS}
            onChange={onChange}
            onClose={handleClose}
            title="More"
        />
    );
}
