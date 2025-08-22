import { Role } from "@/constants/enum";
import { Home, FileArchive, MessageSquarePlus } from "lucide-react";

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
        Icon: Home,
        role: [Role.USER, Role.ADMIN, Role.SUPER_ADMIN],
    },
    {
        title: "posts",
        href: "/tiktokstudio/content",
        Icon: FileArchive,
        role: [Role.USER, Role.ADMIN, Role.SUPER_ADMIN],
    },
    {
        title: "feedback",
        href: "/tiktokstudio/feedback",
        Icon: MessageSquarePlus,
        role: [Role.USER, Role.ADMIN, Role.SUPER_ADMIN],
    },
];
