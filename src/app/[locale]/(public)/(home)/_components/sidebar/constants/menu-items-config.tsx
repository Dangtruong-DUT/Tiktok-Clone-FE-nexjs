import {
    // Outline icons từ Ant Design Icons
    AiOutlineHome,
    AiOutlineCompass,
    AiOutlineCloudUpload,
    AiOutlineBell,
    AiOutlineMessage,
    // Filled icons từ Ant Design Icons
    AiFillHome,
    AiFillCompass,
    AiFillBell,
    AiFillMessage,
} from "react-icons/ai";

import {
    // Outline icons từ Heroicons v2
    HiOutlineUsers,
    HiOutlineUserPlus,
    // Filled icons từ Heroicons v2
    HiUsers,
    HiUserPlus,
    HiCloudArrowUp,
} from "react-icons/hi2";

import { IconType } from "react-icons";
const config = {
    routes: {
        home: "/",
        explore: "/explore",
        following: "/following",
        friends: "/friends",
        upload: "/upload",
        activity: "/activity",
        messages: "/messages",
        live: "/live",
        profile: "/profile",
    },
};
interface MenuItemConfig {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    titleKey: any;
    to: string;
    Icon: IconType;
    ActiveIcon?: IconType;
}

export const HOME_MENU_ITEMS: MenuItemConfig[] = [
    {
        titleKey: "HomePage.menu.forYou",
        to: config.routes.home,
        Icon: AiOutlineHome,
        ActiveIcon: AiFillHome,
    },
    {
        titleKey: "HomePage.menu.explore",
        to: config.routes.explore,
        Icon: AiOutlineCompass,
        ActiveIcon: AiFillCompass,
    },
    {
        titleKey: "HomePage.menu.following",
        to: config.routes.following,
        Icon: HiOutlineUsers,
        ActiveIcon: HiUsers,
    },
    {
        titleKey: "HomePage.menu.friends",
        to: config.routes.friends,
        Icon: HiOutlineUserPlus,
        ActiveIcon: HiUserPlus,
    },
    {
        titleKey: "HomePage.menu.upload",
        to: config.routes.upload,
        Icon: AiOutlineCloudUpload,
        ActiveIcon: HiCloudArrowUp,
    },
    {
        titleKey: "HomePage.menu.activity",
        to: config.routes.activity,
        Icon: AiOutlineBell,
        ActiveIcon: AiFillBell,
    },
    {
        titleKey: "HomePage.menu.messages",
        to: config.routes.messages,
        Icon: AiOutlineMessage,
        ActiveIcon: AiFillMessage,
    },
];
