import { getOauthGoogleUrl } from "@/helper/oauth";
import { UserRound } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

const oauthGoogleUrl = getOauthGoogleUrl();

type MenuItem = {
    title: string;
    icon: React.ReactNode;
    href: string;
    for: ("login" | "signup")[];
};

const MENU_ITEMS: MenuItem[] = [
    {
        title: "Use email",
        icon: <UserRound height="5rem" />,
        href: "/login/email",
        for: ["login"],
    },
    {
        title: "Use email",
        icon: <UserRound height="5rem" />,
        href: "/signup/email",
        for: ["signup"],
    },
    {
        title: "Continue with Google",
        icon: <FcGoogle height="5rem" />,
        href: oauthGoogleUrl,
        for: ["login", "signup"],
    },
] as const;

export default MENU_ITEMS;
