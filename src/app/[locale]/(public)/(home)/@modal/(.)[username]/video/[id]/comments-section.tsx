"use client";

import CommentForm from "@/components/comment-section/comment-form";
import CommentList from "@/components/comment-section/comment-list";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface CommentsSectionProps {
    id: string;
    className?: string;
    handleCloseComments: () => void;
    isVisible: boolean;
    username: string;
}

export default function CommentsSection({
    id,
    className,
    handleCloseComments,
    isVisible,
    username,
}: CommentsSectionProps) {
    if (!isVisible) return null;
    return (
        <section className={cn("flex-1 min-h-screen flex flex-col py-3 pl-3 max-w-96 bg-sidebar border-l", className)}>
            <header className="flex justify-between items-center pe-3 ">
                <h4 className="text-base font-semibold">Comments</h4>
                <Button
                    variant="secondary"
                    className="size-7 aspect-square rounded-full shadow-xs cursor-pointer"
                    onClick={handleCloseComments}
                >
                    <X />
                </Button>
            </header>
            <div className="flex-1 overflow-y-scroll ">
                <CommentList postId={id} username={username} />
            </div>
            <footer className=" pe-3 ">
                <CommentForm postId={id} parentId={id} className="mt-3" />
            </footer>
        </section>
    );
}
