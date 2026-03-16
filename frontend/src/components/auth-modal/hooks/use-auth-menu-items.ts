import { createElement } from "react";
import { UserRound } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { getOauthGoogleUrl } from "@/helper/oauth";
import { AuthMenuItemProps } from "../components/auth-menu-item";

type AuthMode = "login" | "signup" | "login-email" | "signup-email";

export function useAuthMenuItems(mode: AuthMode, setMode: (mode: AuthMode) => void) {
    const oauthGoogleUrl = getOauthGoogleUrl();

    const menuItems: AuthMenuItemProps[] = [
        {
            id: "email",
            title: "Use email",
            icon: createElement(UserRound, { height: "5rem" }),
            action: () => setMode(mode === "login" ? "login-email" : "signup-email"),
            for: ["login", "signup"] as const,
        },
        {
            id: "google",
            title: "Continue with Google",
            icon: createElement(FcGoogle, { height: "5rem" }),
            href: oauthGoogleUrl,
            for: ["login", "signup"] as const,
        },
    ];

    const isLoginFlow = mode.includes("login");
    const currentFor = isLoginFlow ? "login" : "signup";
    return menuItems.filter((item) => item.for.includes(currentFor));
}
