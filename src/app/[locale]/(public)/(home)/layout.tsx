import { SidebarProvider } from "@/app/[locale]/(public)/(home)/_components/sidebar/_context/sidebar.context";
import Sidebar from "@/app/[locale]/(public)/(home)/_components/sidebar/sidebar";
import { LocalesType } from "@/i18n/config";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";

export default function HomeLayout({
    children,
    params,
    modal,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: LocalesType }>;
    modal: React.ReactNode;
}) {
    const { locale } = use(params);

    // Enable static rendering
    setRequestLocale(locale);
    return (
        <div className="sm:flex sm:flex-row">
            <SidebarProvider>
                <Sidebar />
            </SidebarProvider>
            <main className="flex-1 h-screen overflow-auto">{children}</main>
            <aside>{modal}</aside>
        </div>
    );
}
