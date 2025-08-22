"use client";

import { navItems } from "./navItems";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Package2, Settings } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAppSelector } from "@/hooks/redux";

export default function NavLinks() {
    const t = useTranslations("StudioNavigation");
    const pathname = usePathname();
    const role = useAppSelector((state) => state.auth.role);

    return (
        <TooltipProvider>
            <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
                <nav className="flex flex-col items-center gap-4 px-2 py-4">
                    <Link
                        href="/tiktokstudio"
                        className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
                    >
                        <Package2 className="h-4 w-4 transition-all group-hover:scale-110" />
                        <span className="sr-only">TikTok Studio</span>
                    </Link>

                    {navItems.map((Item, index) => {
                        const isActive = pathname === Item.href;
                        if (role && Item.role && !Item.role.includes(role)) return null;

                        return (
                            <Tooltip key={index}>
                                <TooltipTrigger asChild>
                                    <Link
                                        href={Item.href}
                                        className={cn(
                                            "flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8",
                                            {
                                                "bg-accent text-accent-foreground": isActive,
                                                "text-muted-foreground": !isActive,
                                            }
                                        )}
                                    >
                                        <Item.Icon className="h-5 w-5" />
                                        <span className="sr-only">{t(Item.title)}</span>
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent side="right">{t(Item.title)}</TooltipContent>
                            </Tooltip>
                        );
                    })}
                </nav>
                <nav className="mt-auto flex flex-col items-center gap-4 px-2 py-4">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Link
                                href="/tiktokstudio/settings"
                                className={cn(
                                    "flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8",
                                    {
                                        "bg-accent text-accent-foreground": pathname === "/tiktokstudio/settings",
                                        "text-muted-foreground": pathname !== "/tiktokstudio/settings",
                                    }
                                )}
                            >
                                <Settings className="h-5 w-5" />
                                <span className="sr-only">{t("settings")}</span>
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right">{t("settings")}</TooltipContent>
                    </Tooltip>
                </nav>
            </aside>
        </TooltipProvider>
    );
}
