import MENU_ITEMS from "@/app/[locale]/(public)/(auth)/menu-items";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export default async function SignUpPage() {
    const t = await getTranslations("SignUpPage");
    return (
        <div>
            <h1 className="text-2xl font-bold text-center mb-4 mt-16">{t("title")}</h1>
            <div className="grid gap-2">
                {MENU_ITEMS.map((item) => {
                    if (!item.for.includes("signup")) return null;
                    return (
                        <Link key={item.title} href={item.href}>
                            <Button
                                className="w-full cursor-pointer relative h-11 border-none! bg-card "
                                variant="outline"
                            >
                                <span className="absolute left-4">{item.icon}</span>
                                <span className="text-center text-base">{item.title}</span>
                            </Button>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
