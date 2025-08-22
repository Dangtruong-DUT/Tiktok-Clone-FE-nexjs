"use client";

import { navItems } from "./navItems";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Settings } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";

export default function NavLinks() {
    const t = useTranslations("TiktokStudio.navigation");
    const pathname = usePathname();

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="fixed inset-y-0 left-0 z-10 hidden w-[240px] flex-col border-r bg-white lg:flex">
                <div className="flex h-14 items-center px-4 border-b">
                    <Link href="/tiktokstudio" className="flex items-center gap-2">
                        <Image
                            src="/images/tiktok-studio-logo.png"
                            alt="TikTok Studio"
                            width={32}
                            height={32}
                            className="h-8 w-8"
                        />
                        <span className="text-lg font-semibold">TikTok Studio</span>
                    </Link>
                </div>

                <div className="flex flex-col flex-1 py-4">
                    <div className="mb-2 px-2 text-xs font-semibold uppercase text-neutral-500">MANAGE</div>
                    <nav className="space-y-1 px-2">
                        {navItems.map((item, index) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={index}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-neutral-100 text-[#FE2C55]"
                                            : "text-neutral-700 hover:bg-neutral-50"
                                    )}
                                >
                                    <item.Icon
                                        className={cn("h-5 w-5", isActive ? "text-[#FE2C55]" : "text-neutral-700")}
                                    />
                                    {t(item.title)}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="border-t px-2 py-4">
                    <Link
                        href="/tiktokstudio/settings"
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                            pathname === "/tiktokstudio/settings"
                                ? "bg-neutral-100 text-[#FE2C55]"
                                : "text-neutral-700 hover:bg-neutral-50"
                        )}
                    >
                        <Settings
                            className={cn(
                                "h-5 w-5",
                                pathname === "/tiktokstudio/settings" ? "text-[#FE2C55]" : "text-neutral-700"
                            )}
                        />
                        {t("settings")}
                    </Link>
                </div>
            </aside>

            {/* Tablet/Mobile Sidebar */}
            <TooltipProvider>
                <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex lg:hidden">
                    <nav className="flex flex-col items-center gap-4 px-2 py-4">
                        <Link href="/tiktokstudio" className="flex h-8 w-8 items-center justify-center">
                            <Image
                                src="/images/tiktok-studio-logo.png"
                                alt="TikTok Studio"
                                width={24}
                                height={24}
                                className="h-6 w-6"
                            />
                        </Link>

                        {navItems.map((item, index) => {
                            const isActive = pathname === item.href;
                            return (
                                <Tooltip key={index}>
                                    <TooltipTrigger asChild>
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                                                isActive
                                                    ? "bg-neutral-100 text-[#FE2C55]"
                                                    : "text-neutral-700 hover:bg-neutral-50"
                                            )}
                                        >
                                            <item.Icon className="h-5 w-5" />
                                            <span className="sr-only">{t(item.title)}</span>
                                        </Link>
                                    </TooltipTrigger>
                                    <TooltipContent side="right">{t(item.title)}</TooltipContent>
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
                                        "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                                        pathname === "/tiktokstudio/settings"
                                            ? "bg-neutral-100 text-[#FE2C55]"
                                            : "text-neutral-700 hover:bg-neutral-50"
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
        </>
    );
}
