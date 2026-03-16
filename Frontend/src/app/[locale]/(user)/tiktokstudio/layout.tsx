import NavLinks from "@/app/[locale]/(user)/tiktokstudio/_components/nav-links";
import Header from "./_components/header";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: {
        template: "%s | TikTok Studio",
        default: "TikTok Studio",
    },
    description: "Manage your TikTok content, analyze performance, and grow your audience",
    robots: {
        index: false,
        follow: false,
    },
};

export default function StudioLayout({ children, modal }: { children: React.ReactNode; modal: React.ReactNode }) {
    return (
        <div className="h-screen bg-background flex">
            <NavLinks />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-auto scrollbar-hidden">{children}</main>
            </div>
            {modal}
        </div>
    );
}
