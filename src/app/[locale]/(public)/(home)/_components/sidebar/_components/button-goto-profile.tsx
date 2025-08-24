"use client";

import {
    SidebarActiveState,
    SidebarActiveType,
} from "@/app/[locale]/(public)/(home)/_components/sidebar/_types/sidebar.types";
import { AuthModal } from "@/components/auth-modal";
import { AvatarImage, Avatar, AvatarFallback } from "@/components/ui/avatar";
import useCurrentUserData from "@/hooks/data/useCurrentUserData";
import { useAppSelector } from "@/hooks/redux";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { FaRegUser } from "react-icons/fa6";

interface ButtonGotoProfileProps {
    isOpenDrawer: boolean;
    activeState: SidebarActiveState;
    setActiveState: (state: SidebarActiveState) => void;
}

export default function ButtonGotoProfile({ isOpenDrawer, activeState, setActiveState }: ButtonGotoProfileProps) {
    const t = useTranslations("HomePage.menu");
    const role = useAppSelector((state) => state.auth.role);
    const user = useCurrentUserData();

    if (role == null) {
        return (
            <AuthModal>
                <button className="flex items-center h-10 px-2 gap-3 rounded-lg transition-all duration-200 hover:bg-accent">
                    <FaRegUser size={22} className="transition-colors  text-foreground" />
                    {!isOpenDrawer && (
                        <h2 className={cn("text-base font-medium transition-colors duration-200", "text-foreground")}>
                            {t("profile")}
                        </h2>
                    )}
                </button>
            </AuthModal>
        );
    }

    if (user != null) {
        return (
            <Link
                href={`/@${user?.username}`}
                className={cn(
                    "flex items-center h-10 px-2 gap-3 rounded-lg transition-all duration-200 hover:bg-accent",
                    activeState.type === SidebarActiveType.PROFILE && "bg-accent"
                )}
                onClick={() => setActiveState({ type: SidebarActiveType.PROFILE, route: `/@${user.username}` })}
            >
                <Avatar className="size-6 shrink-0">
                    <AvatarImage src={user?.avatar} alt={user.username} />
                    <AvatarFallback className="text-center">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>

                {!isOpenDrawer && (
                    <h2
                        className={cn(
                            "text-base font-medium transition-colors duration-200",
                            activeState.type === SidebarActiveType.PROFILE ? "text-brand" : "text-foreground"
                        )}
                    >
                        {t("profile")}
                    </h2>
                )}
            </Link>
        );
    }
    return null;
}
