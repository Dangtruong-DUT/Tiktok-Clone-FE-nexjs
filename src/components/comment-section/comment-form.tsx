"use client";

import EmojiPiker from "@/components/emoji-picker";
import { FormControl, FormField, FormItem, Form } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { CommentBody, CommentBodyType } from "@/utils/validations/comment.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type CommentFormProps = { className?: string; inputClassName?: string; postId: string; placeholder?: string };

export default function CommentForm({
    className = "",
    postId,
    placeholder = "Add a comment...",
    inputClassName = "",
}: CommentFormProps) {
    const form = useForm<CommentBodyType>({
        resolver: zodResolver(CommentBody),
        defaultValues: {
            content: "",
            post_id: postId,
        },
    });

    const onSubmit = (data: CommentBodyType) => {
        toast("You submitted the following values");
    };

    const handleEmojiSelect = (emoji: string) => {
        form.setValue("content", form.getValues("content") + emoji);
    };

    return (
        <Form {...form}>
            <div className={cn("flex  gap-4", className)}>
                <div className="flex-1  rounded-lg flex items-center justify-between gap-0.5 px-4 border bg-input">
                    <form method="POST" onSubmit={form.handleSubmit(onSubmit)} className="w-full">
                        <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <input
                                            type="text"
                                            autoComplete="off"
                                            spellCheck="false"
                                            placeholder={placeholder}
                                            {...field}
                                            className={cn(
                                                "w-full bg-transparent border-none outline-none py-2 ",
                                                inputClassName
                                            )}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </form>
                    <EmojiPiker onEmojiSelect={handleEmojiSelect} className="[&>svg]:size-5.5! cursor-pointer" />
                </div>
                <button
                    type="submit"
                    className="text-right disabled:text-muted-foreground text-brand font-semibold cursor-pointer"
                >
                    Post
                </button>
            </div>
        </Form>
    );
}
