"use client";

import { getOauthGoogleUrl } from "@/helper/oauth";
import { UserRound } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

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
                    <Link key={item.title} href={item.href}>
                        <Button
                            className="w-full cursor-pointer relative h-11 border border-neutral-300! bg-white! text-black hover:bg-neutral-100! hover:text-black"
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
