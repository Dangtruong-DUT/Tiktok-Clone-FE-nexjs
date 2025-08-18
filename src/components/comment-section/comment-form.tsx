"use client";

import EmojiPiker from "@/components/emoji-picker";
import { FormControl, FormField, FormItem, Form } from "@/components/ui/form";
import { Audience, PosterType } from "@/constants/enum";
import { cn } from "@/lib/utils";
import { useCreateCommentMutation } from "@/services/RTK/posts.services";
import { handleFormError } from "@/utils/handleErrors/handleFormErrors";
import { CreateCommentsReqBody, CreateCommentsReqBodyType } from "@/utils/validations/post.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback } from "react";
import { useForm } from "react-hook-form";

interface CommentFormProps {
    className?: string;
    inputClassName?: string;
    postId: string;
    placeholder?: string;
}

export default function CommentForm({
    className = "",
    postId,
    placeholder = "Add a comment...",
    inputClassName = "",
}: CommentFormProps) {
    const [createCommentMutate, createCommentResult] = useCreateCommentMutation();

    const form = useForm<CreateCommentsReqBodyType>({
        resolver: zodResolver(CreateCommentsReqBody),
        defaultValues: {
            content: "",
            audience: Audience.PUBLIC,
            type: PosterType.COMMENT,
            parent_id: postId,
            hashtags: [],
            medias: [],
            mentions: [],
        },
    });

    const onSubmit = useCallback(
        async (data: CreateCommentsReqBodyType) => {
            if (createCommentResult.isLoading) return;
            try {
                await createCommentMutate(data).unwrap();
                form.reset();
            } catch (error) {
                handleFormError<CreateCommentsReqBodyType>({
                    error,
                    setFormError: form.setError,
                });
            }
        },
        [createCommentMutate, createCommentResult.isLoading, form]
    );

    const handleEmojiSelect = (emoji: string) => {
        form.setValue("content", form.getValues("content") + emoji);
    };

    const content = form.watch("content");

    return (
        <Form {...form}>
            <form method="POST" onSubmit={form.handleSubmit(onSubmit)} className={cn("flex gap-4", className)}>
                <div className="flex-1 rounded-lg flex items-center justify-between gap-0.5 px-4 border bg-input">
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
                    <EmojiPiker onEmojiSelect={handleEmojiSelect} className="[&>svg]:size-5.5! cursor-pointer" />
                </div>
                <button
                    type="submit"
                    className="text-right disabled:text-muted-foreground text-brand font-semibold cursor-pointer"
                    disabled={createCommentResult.isLoading || !content || !form.formState.isValid}
                >
                    Post
                </button>
            </form>
        </Form>
    );
}
