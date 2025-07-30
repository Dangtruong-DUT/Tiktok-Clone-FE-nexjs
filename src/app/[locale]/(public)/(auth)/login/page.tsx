import { ModeToggle } from "@/components/dark-mode-toggle";
import { getTranslations } from "next-intl/server";

export default async function LoginPage() {
    const t = await getTranslations("LoginPage");
    return (
        <div className="font-Tiktok">
            <h1 className="text-2xl font-bold">{t("title")}</h1>
            <ModeToggle />
        </div>
    );
}
