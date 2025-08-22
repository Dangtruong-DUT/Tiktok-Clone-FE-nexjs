"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Header() {
    const t = useTranslations("StudioLayout");

    return (
        <header className="fixed left-14 right-0 top-0 z-10 flex h-14 items-center justify-between border-b bg-background px-4">
            <div className="flex items-center gap-4">
                <Button asChild>
                    <Link href="/tiktokstudio/upload">
                        <Plus className="mr-2 h-4 w-4" />
                        {t("upload")}
                    </Link>
                </Button>
            </div>
        </header>
    );
}
