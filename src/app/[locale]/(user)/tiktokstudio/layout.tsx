import NavLinks from "@/app/[locale]/(user)/tiktokstudio/_components/nav-links";
import Header from "./_components/header";

export default function StudioLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="h-screen bg-background flex">
            <NavLinks />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-auto scrollbar-hidden">{children}</main>
            </div>
        </div>
    );
}
