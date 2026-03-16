import { LocalesType } from "@/i18n/config";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";

export default function LoginLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: LocalesType }>;
}) {
    const { locale } = use(params);
    setRequestLocale(locale);

    return <div className="max-w-sm mx-auto px-4 ">{children}</div>;
}
