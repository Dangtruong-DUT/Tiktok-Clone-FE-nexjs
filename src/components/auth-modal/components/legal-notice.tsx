import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export function LegalNotice() {
    const tAuth = useTranslations("AuthLayout");

    return (
        <div className="h-[4.5rem] bg-card">
            <p className="text-xs text-muted-foreground text-center max-w-sm mx-auto p-4" aria-live="polite">
                {tAuth.rich("notice", {
                    terms: (chunks) => (
                        <Link
                            href="/terms-of-service"
                            target="_blank"
                            className="font-semibold hover:underline text-card-foreground"
                        >
                            {chunks}
                        </Link>
                    ),
                    privacy: (chunks) => (
                        <Link
                            href="/privacy-policy"
                            target="_blank"
                            className="font-semibold hover:underline text-card-foreground"
                        >
                            {chunks}
                        </Link>
                    ),
                })}
            </p>
        </div>
    );
}
