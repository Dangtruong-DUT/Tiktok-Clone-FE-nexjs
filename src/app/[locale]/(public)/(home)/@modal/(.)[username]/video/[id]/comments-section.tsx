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
    username,
    isVisible,
}: CommentsSectionProps) {
    return (
        <section
            className={cn(
                "flex-1 min-h-screen flex flex-col py-3 pl-3 bg-sidebar border-l transition-all duration-300",
                className,
                isVisible ? "w-96 max-w-92 pl-3 py-3 opacity-100" : "w-0 max-w-0 p-0 opacity-0"
            )}
        >
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
