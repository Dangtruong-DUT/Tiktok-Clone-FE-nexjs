import { useDrawerSidebar } from "@/app/[locale]/(public)/(home)/_components/sidebar/_components/drawer/drawer";
import MENU_ITEMS from "@/app/[locale]/(public)/(home)/_components/sidebar/_config/more-menu-items.config";
import AppLoader from "@/components/app-loader";
import NestedMenu from "@/components/nested-menu/nested-menu";
import { MenuGroup, MenuOption } from "@/components/nested-menu/types";
import useLanguage from "@/hooks/shared/useLanguage";
import { useRouter } from "@/i18n/navigation";
import { useLogoutMutation } from "@/services/RTK/auth.services";
import { RootState } from "@/store";
import { useLocale } from "next-intl";
import { useTheme } from "next-themes";
import { useCallback } from "react";
import { useSelector } from "react-redux";

export default function SettingsMenuDrawerContent() {
    const { toggleDrawer } = useDrawerSidebar();
    const role = useSelector((state: RootState) => state.auth.role);
    const locale = useLocale();
    const router = useRouter();
    const { onChange: changeLanguage } = useLanguage();
    const { theme, setTheme } = useTheme();

    const [logoutMutate, logoutResult] = useLogoutMutation();

    const handleLogout = useCallback(async () => {
        try {
            await logoutMutate().unwrap();
            router.replace("/");
        } catch (error) {
            console.error("Logout error:", error);
        }
    }, [logoutMutate, router]);

    const onChange = useCallback(
        async (item: MenuOption) => {
            console.log("Selected item:", item);
            if (item.type === "item" && item.key === "language") {
                return changeLanguage(item.value as string);
            } else if (item.type === "item" && item.key === "theme") {
                return setTheme(item.value as string);
            } else if (item.type === "item" && item.key === "logout") {
                await handleLogout();
            }
        },
        [changeLanguage, setTheme, handleLogout]
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
            {logoutResult.isLoading && <AppLoader />}
        </>
    );
}
