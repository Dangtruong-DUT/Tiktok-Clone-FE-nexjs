import ClearTokenByServer from "@/app/[locale]/(public)/(home)/@modal/(auth)/(.)login/clear-token-by-server";
import MENU_ITEMS from "@/app/[locale]/(public)/(home)/@modal/(auth)/menu-items";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export default async function LoginPage() {
    const t = await getTranslations("LoginPage");
    return (
        <div>
            <h1 className="text-2xl font-bold text-center mb-4 mt-16">{t("title")}</h1>
            <div className="grid gap-2">
                {MENU_ITEMS.map((item) => {
                    if (!item.for.includes("login")) return null;
                    return (
                        <Link key={item.title} href={item.href}>
                            <Button
                                className="w-full bg-card! cursor-pointer relative h-11 border-none "
                                variant="outline"
                            >
                                <span className="absolute left-4">{item.icon}</span>
                                <span className="text-center text-base">{item.title}</span>
                            </Button>
                        </Link>
                    );
                })}
            </div>
            <ClearTokenByServer />
        </div>
    );
}
