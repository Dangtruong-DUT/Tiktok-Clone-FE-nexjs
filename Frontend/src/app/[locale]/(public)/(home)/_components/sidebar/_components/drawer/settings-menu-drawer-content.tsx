import { useDrawerSidebar } from "@/app/[locale]/(public)/(home)/_components/sidebar/_components/drawer/drawer";
import MENU_ITEMS from "@/app/[locale]/(public)/(home)/_components/sidebar/_config/more-menu-items.config";
import DialogConfirmLogout from "@/components/dialog-confirm-Logout";
import NestedMenu from "@/components/nested-menu/nested-menu";
import { MenuGroup, MenuOption } from "@/components/nested-menu/types";
import useLanguage from "@/hooks/shared/useLanguage";
import { RootState } from "@/store";
import { useLocale } from "next-intl";
import { useTheme } from "next-themes";
import { useCallback, useState } from "react";
import { useSelector } from "react-redux";

export default function SettingsMenuDrawerContent() {
    const { toggleDrawer } = useDrawerSidebar();
    const role = useSelector((state: RootState) => state.auth.role);
    const locale = useLocale();
    const { onChange: changeLanguage } = useLanguage();
    const { theme, setTheme } = useTheme();
    const [isDialogConfirmLogoutOpen, setIsDialogConfirmLogoutOpen] = useState(false);

    const onChange = useCallback(
        async (item: MenuOption) => {
            if (item.type === "item" && item.key === "language") {
                return changeLanguage(item.value as string);
            } else if (item.type === "item" && item.key === "theme") {
                return setTheme(item.value as string);
            } else if (item.type === "item" && item.key === "logout") {
                setIsDialogConfirmLogoutOpen(true);
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
        <>
            <NestedMenu
                getTitleOfGroup={getTitleOfGroup}
                items={MENU_ITEMS}
                onChange={onChange}
                onClose={toggleDrawer}
                isChecked={setIChecked}
                titleKeyI18n="menuMore.title"
                for={role != null ? "user" : "guest"}
            />
            <DialogConfirmLogout isOpen={isDialogConfirmLogoutOpen} onOpenChange={setIsDialogConfirmLogoutOpen} />
        </>
    );
}
