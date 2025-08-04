import CommentsMain from "@/app/[locale]/(public)/(home)/@videoComments/(.)[username]/video/[id]/comments-main";
import CommentsWrapper from "@/app/[locale]/(public)/(home)/@videoComments/(.)[username]/video/[id]/wrapper";
import { AtSign, Smile } from "lucide-react";

export default async function CommentsSection({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return (
        <CommentsWrapper>
            <div className="flex-1">
                <CommentsMain postId={id} />
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
                <button type="submit" className="text-right text-accent-foreground">
                    Post
                </button>
            </footer>
        </CommentsWrapper>
    );
}
