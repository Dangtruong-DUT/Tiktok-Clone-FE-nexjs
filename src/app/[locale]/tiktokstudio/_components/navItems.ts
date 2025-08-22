import { Role } from "@/constants/enum";
import { Home, Film, MessageSquareWarning } from "lucide-react";

interface NavItem {
    title: any;
    href: string;
    Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    role?: Role[];
}

export const navItems: NavItem[] = [
    {
        title: "home",
        href: "/tiktokstudio",
        Icon: Home,
        role: [Role.USER, Role.ADMIN, Role.SUPER_ADMIN],
    },
    {
        title: "posts",
        href: "/tiktokstudio/content",
        Icon: Film,
        role: [Role.USER, Role.ADMIN, Role.SUPER_ADMIN],
    },
    {
        title: "feedback",
        href: "/tiktokstudio/feedback",
        Icon: MessageSquareWarning,
        role: [Role.USER, Role.ADMIN, Role.SUPER_ADMIN],
    },
];
