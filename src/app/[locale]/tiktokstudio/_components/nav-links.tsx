"use client";

import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import LogoBrand from "@/components/logo-brand";
import { navItems } from "@/app/[locale]/tiktokstudio/_config/navItems";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Plus } from "lucide-react";

export default function NavLinks() {
    const t = useTranslations("TiktokStudio.navigation");
    const t2 = useTranslations("StudioLayout");
    const pathname = usePathname();
    return (
        <>
            <aside className="hidden w-62 flex-col border-r  lg:flex">
                <div className="flex h-17 items-center px-5 border-b">
                    <Link href="/tiktokstudio" className="flex items-center">
                        <LogoBrand small={false} />
                    </Link>
                </div>

                <div className="flex flex-col justify-between flex-1 py-4 px-5">
                    <div className="flex flex-col gap-4">
                        <Link
                            href="/tiktokstudio/upload"
                            className={cn("mb-4 mt-5", {
                                "select-none opacity-40 cursor-not-allowed": pathname === "/tiktokstudio/upload",
                            })}
                        >
                            <Button className={cn("primary-button h-9! rounded-lg! w-full cursor-pointer ")}>
                                <Plus className="size-5" />
                                <span>{t2("upload")}</span>
                            </Button>
                        </Link>
                        <nav className="space-y-2 ">
                            <h2 className="text-sm font-semibold">Manage</h2>
                            {navItems.map((item, index) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link key={index} href={item.href} className="block">
                                        <Button
                                            variant="ghost"
                                            className={cn(
                                                "w-full text-sm font-medium transition-colors flex justify-start gap-2",
                                                {
                                                    " text-brand": isActive,
                                                }
                                            )}
                                        >
                                            <item.Icon
                                                className={cn("h-5 w-5", {
                                                    "text-brand": isActive,
                                                })}
                                            />
                                            {t(item.title)}
                                        </Button>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    <div>
                        <Link href="/">
                            <Button
                                variant="ghost"
                                className="w-full text-sm font-medium transition-colors flex justify-start gap-2"
                            >
                                <ChevronLeft className="h-5 w-5" />
                                {t("back")}
                            </Button>
                        </Link>
                    </div>
                </div>
            </aside>

            <TooltipProvider>
                <aside className=" w-14 flex-col border-r bg-background sm:flex lg:hidden">
                    <nav className="flex flex-col items-center gap-4 px-2 py-4">
                        <Link href="/tiktokstudio" className="flex h-8 w-8 items-center justify-center">
                            <LogoBrand small={true} />
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
                                                {
                                                    "text-brand": isActive,
                                                }
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
                </aside>
            </TooltipProvider>
        </>
    );
}
