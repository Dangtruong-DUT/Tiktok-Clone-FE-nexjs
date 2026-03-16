import {
    // Outline icons từ Ant Design Icons
    AiOutlineHome,
    AiOutlineCloudUpload,
    // Filled icons từ Ant Design Icons
    AiFillHome,
} from "react-icons/ai";

import {
    // Outline icons từ Heroicons v2
    HiOutlineUsers,
    // Filled icons từ Heroicons v2
    HiUsers,
    HiCloudArrowUp,
} from "react-icons/hi2";

import { IconType } from "react-icons";
export const sidebarConfig = {
    routes: {
        home: "/",
        explore: "/explore",
        following: "/following",
        upload: "/tiktokstudio/upload",
    },
} as const;

export type routesValuesType = (typeof sidebarConfig.routes)[keyof typeof sidebarConfig.routes];

export interface MenuItemConfig {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    titleKey: any;
    to: routesValuesType;
    Icon: IconType;
    ActiveIcon?: IconType;
    requiredAuth?: boolean;
    viewFor: "all" | "authenticated";
}

export const HOME_MENU_ITEMS: MenuItemConfig[] = [
    {
        titleKey: "HomePage.menu.forYou",
        to: sidebarConfig.routes.home,
        Icon: AiOutlineHome,
        ActiveIcon: AiFillHome,
        requiredAuth: false,
        viewFor: "all",
    },
    {
        titleKey: "HomePage.menu.following",
        to: sidebarConfig.routes.following,
        Icon: HiOutlineUsers,
        ActiveIcon: HiUsers,
        requiredAuth: true,
        viewFor: "all",
    },
    {
        titleKey: "HomePage.menu.upload",
        to: sidebarConfig.routes.upload,
        Icon: AiOutlineCloudUpload,
        ActiveIcon: HiCloudArrowUp,
        requiredAuth: true,
        viewFor: "all",
    },
];
