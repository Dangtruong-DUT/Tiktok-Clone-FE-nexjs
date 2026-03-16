import DirectorLineChart from "@/app/[locale]/(user)/tiktokstudio/_components/director-line-chart";
import UserInfo from "./_components/user-info";
import RecentPosts from "@/app/[locale]/(user)/tiktokstudio/_components/recent-posts";
import KnowledgeForYou from "@/app/[locale]/(user)/tiktokstudio/_components/Knowledge-for-you";
import Footer from "@/app/[locale]/(user)/tiktokstudio/_components/footer";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Dashboard",
    description: "View your TikTok analytics, recent posts, and performance metrics",
};

export default function DashboardPage() {
    return (
        <div>
            <div className="py-8 px-4 md:px-8 space-y-8">
                <UserInfo />
                <DirectorLineChart />
                <div className="flex gap-6 xl:flex-row flex-col">
                    <RecentPosts classNames="flex-1" />
                    <KnowledgeForYou />
                </div>
            </div>
            <Footer />
        </div>
    );
}
