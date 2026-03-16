"use client";

import { AuthModal } from "@/components/auth-modal";
import EmojiPiker from "@/components/emoji-picker";
import { FormControl, FormField, FormItem, Form } from "@/components/ui/form";
import { Audience, PosterType } from "@/constants/enum";
import { useAppSelector } from "@/hooks/redux";
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
    parentId: string;
    placeholder?: string;
    popoverEmojiClassName?: string;
    onClose?: () => void;
}

function CommentForm({
    className = "",
    postId,
    parentId,
    placeholder = "Add a comment...",
    inputClassName = "",
    popoverEmojiClassName,
    onClose,
}: CommentFormProps) {
    const [createCommentMutate, createCommentResult] = useCreateCommentMutation();

    const form = useForm<CreateCommentsReqBodyType>({
        resolver: zodResolver(CreateCommentsReqBody),
        defaultValues: {
            content: "",
            audience: Audience.PUBLIC,
            type: PosterType.COMMENT,
            parent_id: parentId,
            hashtags: [],
            medias: [],
            mentions: [],
        },
    });

    const onSubmit = useCallback(
        async (data: CreateCommentsReqBodyType) => {
            if (createCommentResult.isLoading) return;
            try {
                await createCommentMutate({ ...data, post_id: postId }).unwrap();
                form.reset();
                onClose?.();
            } catch (error) {
                handleFormError<CreateCommentsReqBodyType>({
                    error,
                    setFormError: form.setError,
                });
                console.log(error);
            }
        },
        [createCommentMutate, createCommentResult.isLoading, form, onClose, postId]
    );

    const handleEmojiSelect = (emoji: string) => {
        form.setValue("content", form.getValues("content") + emoji);
    };

    return (
        <Form {...form}>
            <form method="POST" onSubmit={form.handleSubmit(onSubmit)} className={cn("flex gap-4", className)}>
                <div className="flex-1 rounded-lg flex items-center justify-between gap-0.5 px-4 border bg-input">
                    <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                            <FormItem className="flex-1">
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
                    <EmojiPiker
                        onEmojiSelect={handleEmojiSelect}
                        className="[&>svg]:size-5.5! cursor-pointer"
                        popoverClassName={popoverEmojiClassName}
                    />
                </div>
                <button
                    type="submit"
                    className="text-right disabled:text-muted-foreground text-brand font-semibold cursor-pointer"
                    disabled={createCommentResult.isLoading || !form.formState.isValid}
                >
                    Post
                </button>
            </form>
        </Form>
    );
}

export default function CommentFormWrapper(props: CommentFormProps) {
    const role = useAppSelector((state) => state.auth.role);
    if (role == null) {
        return (
            <AuthModal>
                <div className="relative">
                    <CommentForm {...props} />
                    <button className="absolute inset-0 bg-transparent" />
                </div>
            </AuthModal>
        );
    }

    return <CommentForm {...props} />;
}
