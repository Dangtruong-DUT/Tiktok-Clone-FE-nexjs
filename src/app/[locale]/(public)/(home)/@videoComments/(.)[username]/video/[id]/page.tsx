import CommentsWrapper from "@/app/[locale]/(public)/(home)/@videoComments/(.)[username]/video/[id]/wrapper";
import CommentForm from "@/components/comment-section/comment-form";
import CommentList from "@/components/comment-section/comment-list";

export default async function CommentsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return (
        <CommentsWrapper className="flex-1 h-screen flex flex-col py-3 pl-3 w-96 bg-sidebar border-l transition-transform duration-300">
            <div className="flex-1 overflow-y-scroll ">
                <CommentList postId={id} />
            </div>
            <footer className=" pe-3 ">
                <CommentForm postId={id} className="mt-3" />
            </footer>
        </CommentsWrapper>
    );
}
