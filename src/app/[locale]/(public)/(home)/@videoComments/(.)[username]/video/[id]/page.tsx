import CommentList from "@/app/[locale]/(public)/(home)/@videoComments/(.)[username]/video/[id]/comment-list";
import CommentsWrapper from "@/app/[locale]/(public)/(home)/@videoComments/(.)[username]/video/[id]/wrapper";
import { AtSign, Smile } from "lucide-react";

export default async function CommentsPage() {
    return (
        <CommentsWrapper>
            <div className="flex-1">
                <CommentList />
            </div>
            <footer className=" flex pe-3 h-11.5 gap-4">
                <div className="flex-1  rounded-lg flex items-center justify-between gap-0.5 px-4 border bg-input">
                    <form action="">
                        <input
                            type="text"
                            placeholder="Add a comment..."
                            className="w-full bg-transparent border-none outline-none py-4"
                        />
                    </form>

                    <AtSign />
                    <Smile />
                </div>
                <button type="submit" className="text-right disabled:text-muted-foreground text-brand font-semibold">
                    Post
                </button>
            </footer>
        </CommentsWrapper>
    );
}
