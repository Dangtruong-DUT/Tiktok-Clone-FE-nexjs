"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import VideoPlayer from "@/components/video-player-v3";
import CommentForm from "@/components/comment-section/comment-form";
import CommentList from "@/components/comment-section/comment-list";
import { useCallback, useEffect, useRef, useState } from "react";
import VideoDescription from "@/components/video-dialog/video-description";
import TabNavigation from "@/components/video-dialog/tab-navigation";
import { TikTokPostType } from "@/types/schemas/TikTokPost.schemas";
import LoadingIcon from "@/components/lottie-icons/loading";
import { FiChevronsUp } from "react-icons/fi";
import { Button } from "@/components/ui/button";

interface VideoDetailDialogProps {
    isVisible: boolean;
    handleClose: () => void;
    post?: TikTokPostType;
}

export default function VideoDetailDialog({ isVisible, handleClose, post }: VideoDetailDialogProps) {
    return (
        <>
            <Dialog open={isVisible} onOpenChange={handleClose}>
                <DialogContent
                    className="w-[90vw]! h-[90vh]! flex flex-row p-0 max-w-none!  gap-0! rounded-sm overflow-hidden"
                    showCloseButton={false}
                >
                    <DialogTitle className="hidden" />
                    {post && <DialogVideoContent post={post} />}
                    {!post && <LoadingIcon className="size-15 m-auto" loop />}
                </DialogContent>
            </Dialog>
        </>
    );
}

interface DialogContentProps {
    post: TikTokPostType;
}

function DialogVideoContent({ post }: DialogContentProps) {
    const [activeTab, setActiveTab] = useState<"comments" | "creator">("comments");
    const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
    const author = post.author;
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleScroll = () => {
            if (container.scrollTop > 400) {
                setShowScrollTop(true);
            } else {
                setShowScrollTop(false);
            }
        };

        container.addEventListener("scroll", handleScroll);
        return () => container.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = useCallback(() => {
        containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }, [containerRef]);

    return (
        <>
            <div className="flex-1 shrink-0 basis-[300px] bg-black h-full">
                <VideoPlayer post={post} />
            </div>
            <div className="flex-1 relative">
                <div
                    ref={containerRef}
                    className=" flex flex-col bg-background h-[90vh]! overflow-auto scrollbar-hidden relative"
                >
                    <VideoDescription post={post} />
                    <TabNavigation
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        className="sticky top-0 z-10 bg-background"
                    />

                    <div className="flex-1 flex flex-col">
                        {activeTab === "comments" && (
                            <>
                                <div className="flex-1 px-4">
                                    <CommentList postId={post._id} username={author?.username} />
                                </div>

                                <div className="p-4 border-t sticky bottom-0 left-0 bg-background">
                                    <CommentForm
                                        postId={post._id}
                                        parentId={post._id}
                                        placeholder="Add comment..."
                                        className="w-full"
                                        popoverEmojiClassName="   absolute! z-[1000]! pointer-events-auto bottom-[calc(100%+40px)]! left-1/2! -translate-x-1/2!"
                                    />
                                </div>
                            </>
                        )}

                        {activeTab === "creator" && (
                            <div className="flex-1 p-4 flex items-center justify-center text-muted-foreground">
                                Creator videos content goes here
                            </div>
                        )}
                    </div>
                </div>

                {showScrollTop && (
                    <Button
                        variant="secondary"
                        className="absolute  bottom-25 right-6 shadow-lg rounded-full flex items-center justify-center "
                        onClick={scrollToTop}
                    >
                        Back to top <FiChevronsUp className="w-5 h-5" />
                    </Button>
                )}
            </div>
        </>
    );
}
