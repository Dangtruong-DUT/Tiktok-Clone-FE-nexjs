import { routesValuesType } from "@/app/[locale]/(public)/(home)/_components/sidebar/_config/menu-items-sidebar.config";

export enum SidebarActiveType {
    // Navigation items
    HOME = "home",
    EXPLORE = "explore",
    FOLLOWING = "following",
    UPLOAD = "upload",
    ACTIVITY = "activity",
    MESSAGES = "messages",

    // Special actions
    PROFILE = "profile",
    MORE = "more",
    SEARCH = "search",

    // Default state
    NONE = "none",
}

export interface SidebarActiveState {
    type: SidebarActiveType;
    route?: string;
}

export const routeToActiveType: Record<routesValuesType, SidebarActiveType> = {
    "/": SidebarActiveType.HOME,
    "/explore": SidebarActiveType.EXPLORE,
    "/following": SidebarActiveType.FOLLOWING,
    "/tiktokstudio/upload": SidebarActiveType.UPLOAD,
};
