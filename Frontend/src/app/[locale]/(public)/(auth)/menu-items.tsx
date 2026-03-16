"use client";

import { getOauthGoogleUrl } from "@/helper/oauth";
import { UserRound } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const oauthGoogleUrl = getOauthGoogleUrl();

export function MenuItemsList({ type }: { type: "login" | "signup" }) {
    const t = useTranslations("menuItems");
    const menuItems = [
        {
            title: t("useEmail"),
            icon: <UserRound height="5rem" />,
            href: `/${type}/email`,
            for: [type],
        },
        {
            title: t("continueWithGoogle"),
            icon: <FcGoogle height="5rem" />,
            href: oauthGoogleUrl,
            for: ["login", "signup"],
        },
    ] as const;

    return (
        <div className="grid gap-2">
            {menuItems.map((item) => {
                if (!item.for.includes(type)) return null;
                return (
                    <Link
                        key={item.title}
                        href={item.href}
                        className={cn({
                            " relative before:content-['Unavailable'] before:absolute before:right-4 before:-translate-y-1/2  before:bg-red-500 before:text-white before:px-2 before:py-1 before:rounded-tr-full before:rounded-tl-full before:rounded-br-full before:rounded-bl-none before:text-xs before:font-semibold before:z-10":
                                item.href === "#!",
                        })}
                    >
                        <Button
                            className={cn(
                                "w-full cursor-pointer relative h-11 border border-neutral-300! bg-white! text-black hover:bg-neutral-100! hover:text-black",
                                {
                                    "cursor-not-allowed! opacity-50 select-none ": item.href === "#!",
                                }
                            )}
                            variant="outline"
                        >
                            <span className="absolute left-4">{item.icon}</span>
                            <span className="text-center text-base">{item.title}</span>
                        </Button>
                    </Link>
                );
            })}
        </div>
    );
}
