"use client";

import NavLinks from "@/app/[locale]/tiktokstudio/_components/nav-links";
import Header from "./_components/header";

export default function StudioLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className=" min-h-screen bg-background flex">
            <NavLinks />
            <div className="flex-1 flex flex-col">
                <Header />
                <main className="max-h-[calc(100vh-4.25rem)] overflow-auto">{children}</main>
            </div>
        </div>
    );
}
