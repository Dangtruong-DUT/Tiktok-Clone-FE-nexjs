"use server";

import LogoBrand from "@/components/LogoBrand";
import { Link } from "@/i18n/navigation";
import { MessageCircleQuestionMark } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function AuthHeader() {
    const t = await getTranslations("header");
    return (
        <header className="flex items-center justify-between bg-white px-4 h-[3.75rem] text-black ">
            <Link href="/">
                <LogoBrand className="h-10" />
            </Link>
            <Link href="/help" className="text-sm font-bold hover:text-neutral-800 flex items-center gap-2">
                <MessageCircleQuestionMark />
                <span className="hover:underline">{t("help")}</span>
            </Link>
        </header>
    );
}
