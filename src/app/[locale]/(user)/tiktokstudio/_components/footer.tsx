import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function Footer() {
    const t = useTranslations("TiktokStudio.footer");

    return (
        <footer className=" border-t border-border p-8 flex justify-between items-center">
            <span className="text-muted-foreground text-xs">{t("copyright")}</span>
            <div className="flex gap-6">
                <Link href="/privacy-policy" className="text-muted-foreground text-xs">
                    {t("privacyPolicy")}
                </Link>
                <Link href="/terms-of-service" className="text-muted-foreground text-xs">
                    {t("termsOfService")}
                </Link>
            </div>
        </footer>
    );
}
