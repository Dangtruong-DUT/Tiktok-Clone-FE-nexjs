"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import VideoPlayer from "@/components/video-player-v3";
import CommentForm from "@/components/comment-section/comment-form";
import CommentList from "@/components/comment-section/comment-list";
import { useState } from "react";
import VideoDescription from "@/components/video-dialog/video-description";
import TabNavigation from "@/components/video-dialog/tab-navigation";
import { UserType } from "@/types/schemas/User.schema";
import { TikTokPostType } from "@/types/schemas/TikTokPost.schemas";

interface VideoDetailDialogProps {
    isVisible: boolean;
    handleClose: () => void;
    author: UserType;
    post: TikTokPostType;
}

export default function VideoDetailDialog({ isVisible, handleClose, author, post }: VideoDetailDialogProps) {
    const [activeTab, setActiveTab] = useState<"comments" | "creator">("comments");

    return (
        <>
            <Dialog open={isVisible} onOpenChange={handleClose}>
                <DialogContent
                    className="w-[90vw]! h-[90vh]! flex flex-row p-0 max-w-none!  gap-0! rounded-sm overflow-hidden"
                    showCloseButton={false}
                >
                    <div className="flex-1 shrink-0 basis-[300px] bg-black h-full">
                        <VideoPlayer author={author} post={post} />
                    </div>

                    <div className="flex-1 flex flex-col bg-background h-[90vh]! overflow-auto scrollbar-hidden">
                        <VideoDescription post={post} user={author} />
                        <TabNavigation
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            className="sticky top-0 z-10 bg-background"
                        />

                        <div className="flex-1 flex flex-col">
                            {activeTab === "comments" && (
                                <>
                                    <div className="flex-1  px-4 ">
                                        <CommentList postId={post._id} />
                                    </div>

                                    <div className="p-4 border-t sticky bottom-0 bg-background">
                                        <CommentForm
                                            postId={post._id}
                                            placeholder="Add comment..."
                                            className="w-full"
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
                </DialogContent>
            </Dialog>
        </>
    );
}
