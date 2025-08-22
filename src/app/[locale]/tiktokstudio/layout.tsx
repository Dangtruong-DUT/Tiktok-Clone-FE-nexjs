"use client";

import NavLinks from "./_components/nav-links";
import Header from "./_components/header";

export default function StudioLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative min-h-screen bg-background">
            <NavLinks />
            <Header />
            <main className="relative ml-14 mt-14 min-h-[calc(100vh-3.5rem)]">{children}</main>
        </div>
    );
}
