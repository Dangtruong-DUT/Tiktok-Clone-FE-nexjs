import Footer from "@/components/footer-v1";
import Header from "@/components/header-v1";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div>
            <Header classname="bg-card" />
            <main className="h-[calc(100vh-3.75rem-5.25rem)] flex overflow-auto">{children}</main>
            <Footer classname="border-t" />
        </div>
    );
}
