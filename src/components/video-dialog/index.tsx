"use client";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import VideoPlayer from "@/components/video-player-v3";
import { mockUser, mockVideoPost } from "@/mock/mockUserAndVideos";
import CommentForm from "@/components/comment-section/comment-form";
import CommentList from "@/components/comment-section/comment-list";
import { useState } from "react";
import VideoDescription from "@/components/video-dialog/video-description";
import TabNavigation from "@/components/video-dialog/tab-navigation";
import { X } from "lucide-react";

export default function VideoDetailDialog() {
    const post = mockVideoPost;
    const user = mockUser;
    const [dialogOpen, setDialogOpen] = useState(true);
    const [activeTab, setActiveTab] = useState<"comments" | "creator">("comments");

    return (
        <Dialog modal open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger>Open</DialogTrigger>
            <DialogContent
                showCloseButton={false}
                className="w-[90vw]! h-[90vh]! flex flex-row p-0 max-w-none!  gap-0! "
            >
                <button
                    className="absolute -top-5 -right-15 z-10 p-2 rounded-full bg-transparent hover:bg-muted transition-colors"
                    onClick={() => setDialogOpen(false)}
                >
                    <X />
                </button>
                <div className="flex-1 shrink-0 basis-[300px] bg-black h-full">
                    <VideoPlayer author={user} post={post} />
                </div>

                <div className="flex-1 flex flex-col bg-background h-[90vh]! overflow-auto scrollbar-hidden">
                    <VideoDescription post={post} user={user} />
                    <TabNavigation
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        className="sticky top-0 z-10 bg-background"
                    />

                    <div className="flex-1 flex flex-col">
                        {activeTab === "comments" && (
                            <>
                                <div className="flex-1  px-4 ">
                                    <CommentList postId={mockVideoPost._id} />
                                </div>

                                <div className="p-4 border-t sticky bottom-0 bg-background">
                                    <CommentForm
                                        postId={mockVideoPost._id}
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
    );
}
