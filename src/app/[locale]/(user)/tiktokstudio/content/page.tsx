import TableContent from "@/app/[locale]/(user)/tiktokstudio/content/_components/table-content";
import PostTableProvider from "@/app/[locale]/(user)/tiktokstudio/content/_context/content-table.context";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Content Manager",
    description: "Manage and analyze all your TikTok videos in one place",
};

export default function ContentPage() {
    return (
        <div className="p-4 sm:px-6">
            <PostTableProvider>
                <TableContent />
            </PostTableProvider>
        </div>
    );
}
