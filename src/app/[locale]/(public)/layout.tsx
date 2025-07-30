import { LocalesType } from "@/i18n/config";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";

export default function PublicLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: LocalesType }>;
}) {
    const { locale } = use(params);

    // Enable static rendering
    setRequestLocale(locale);
    return <div>{children}</div>;
}
