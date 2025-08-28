import TableContent from "@/app/[locale]/(user)/tiktokstudio/content/_components/table-content";
import PostTableProvider from "@/app/[locale]/(user)/tiktokstudio/content/_context/content-table.context";

export default function ContentPage() {
    return (
        <div className="p-4">
            <PostTableProvider>
                <TableContent />
            </PostTableProvider>
        </div>
    );
}
