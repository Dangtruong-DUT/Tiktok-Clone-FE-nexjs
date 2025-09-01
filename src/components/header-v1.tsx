"use server";

import LogoBrand from "@/components/logo-brand";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { MessageCircleQuestionMark } from "lucide-react";
import { getTranslations } from "next-intl/server";

interface HeaderProps {
    classname?: string;
}

export default async function Header({ classname }: HeaderProps) {
    const t = await getTranslations("header");
    return (
        <header className={cn("flex items-center justify-between  px-4 h-[3.75rem]", classname)}>
            <Link href="/">
                <LogoBrand className="h-10" />
                <span className="sr-only">tiktok</span>
            </Link>
            <Link
                href="mailto:ndtrg281@gmail.com"
                className="text-sm font-semibold hover:text-neutral-800 flex items-center gap-2"
            >
                <MessageCircleQuestionMark />
                <span className="hover:underline">{t("help")}</span>
            </Link>
        </header>
    );
}
