import { Role } from "@/constants/enum";
import { Settings, LayoutPanelLeft, BookUp } from "lucide-react";

interface NavItem {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    title: any;
    href: string;
    Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    role?: Role[];
}

export const navItems: NavItem[] = [
    {
        title: "home",
        href: "/tiktokstudio",
        Icon: LayoutPanelLeft,
        role: [Role.USER, Role.ADMIN, Role.SUPER_ADMIN],
    },
    {
        title: "posts",
        href: "/tiktokstudio/content",
        Icon: BookUp,
        role: [Role.USER, Role.ADMIN, Role.SUPER_ADMIN],
    },
    {
        title: "settings",
        href: "/tiktokstudio/settings",
        Icon: Settings,
        role: [Role.USER, Role.ADMIN, Role.SUPER_ADMIN],
    },
];
