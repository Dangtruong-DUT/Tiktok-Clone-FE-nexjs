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
    title: string;
    to: string;
    Icon: IconType;
    ActiveIcon?: IconType;
}

export const HOME_MENU_ITEMS: MenuItemConfig[] = [
    {
        title: "For You",
        to: config.routes.home,
        Icon: AiOutlineHome,
        ActiveIcon: AiFillHome, // Filled version
    },
    {
        title: "Explore",
        to: config.routes.explore,
        Icon: AiOutlineCompass,
        ActiveIcon: AiFillCompass, // Filled version
    },
    {
        title: "Following",
        to: config.routes.following,
        Icon: HiOutlineUsers,
        ActiveIcon: HiUsers, // Filled version
    },
    {
        title: "Friends",
        to: config.routes.friends,
        Icon: HiOutlineUserPlus,
        ActiveIcon: HiUserPlus, // Filled version
    },
    {
        title: "Upload",
        to: config.routes.upload,
        Icon: AiOutlineCloudUpload,
        ActiveIcon: HiCloudArrowUp, // Filled version
    },
    {
        title: "Activity",
        to: config.routes.activity,
        Icon: AiOutlineBell,
        ActiveIcon: AiFillBell, // Filled version
    },
    {
        title: "Messages",
        to: config.routes.messages,
        Icon: AiOutlineMessage,
        ActiveIcon: AiFillMessage, // Filled version
    },
];
