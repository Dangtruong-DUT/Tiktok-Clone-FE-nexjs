import CommentForm from "@/components/comment-section/comment-form";
import CommentList from "@/components/comment-section/comment-list";
import { cn } from "@/lib/utils";

type CommentSectionProps = {
    className?: string;
    postId: string;
    username: string;
};

export default function CommentSection({ className, postId, username }: CommentSectionProps) {
    return (
        <section className={cn("flex-1 pb-6", className)} id={`comment-section-${postId}`}>
            <h4 className="text-lg font-semibold">Comments</h4>
            <CommentForm postId={postId} parentId={postId} className="mt-3 pb-6 border-b border-border" />
            <CommentList postId={postId} username={username} />
        </section>
    );
}
