import CommentForm from "@/components/comment-section/comment-form";
import CommentList from "@/components/comment-section/comment-list";
import { cn } from "@/lib/utils";

type CommentSectionProps = {
    className?: string;
    postId: string;
};

export default function CommentSection({ className, postId }: CommentSectionProps) {
    return (
        <section className={cn("flex-1 pb-6", className)}>
            <h4 className="text-lg font-semibold">Comments</h4>
            <CommentForm postId={postId} className="mt-3 pb-6 border-b border-border" />
            <CommentList postId={postId} />
        </section>
    );
}
