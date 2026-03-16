"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { CreatePostReqBodyType, UpdatePostReqBody, UpdatePostReqBodyType } from "@/utils/validations/post.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Audience } from "@/constants/enum";
import { Textarea } from "@/components/ui/textarea";
import { Info, Loader } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import VideoPreview from "@/app/[locale]/(user)/tiktokstudio/upload/_components/video-preview";
import SelectThumbnailDialog from "@/app/[locale]/(user)/tiktokstudio/upload/_components/select-thumbnail-dialog";

import { useUploadImageMutation } from "@/services/RTK/upload.services";
import { useGetPostDetailQuery, useUpdatePostMutation } from "@/services/RTK/posts.services";
import { handleFormError } from "@/utils/handleErrors/handleFormErrors";
import { audienceStatusValues } from "@/constants/types";
import { getAudienceNameFromEnum } from "@/helper/getNameFromStatus";
import { SearchParamsLoader, useSearchParamsLoader } from "@/components/searchparams-loader";
import { useRouter } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import useVideoFrames from "@/hooks/video/useVideoFrames";
import LoadingIcon from "@/components/lottie-icons/loading";
import useCurrentUserData from "@/hooks/data/useCurrentUserData";
import { useConfirmNavigation } from "@/hooks/shared/useConfirmNavigation";
import AlertDialogExitPage from "@/app/[locale]/(user)/tiktokstudio/upload/_components/alert-confirm-leave-page";

export default function FormUpdatePost() {
    const { id } = useParams<{ id: string }>();
    const [uploadImageMutate, uploadImageResult] = useUploadImageMutation();
    const [updatePostMutate, createPostResult] = useUpdatePostMutation();
    const { searchParams, setSearchParams } = useSearchParamsLoader();
    const currentUser = useCurrentUserData();
    const redirectFrom = searchParams?.get("from");
    const router = useRouter();

    const { data, isLoading, error } = useGetPostDetailQuery(id, { skip: !id });
    const post = data?.data;
    const {
        showModal: isOpenModalConfirmExit,
        stayHere,
        leavePage,
    } = useConfirmNavigation({
        shouldConfirm: post !== undefined,
    });

    const form = useForm<UpdatePostReqBodyType>({
        resolver: zodResolver(UpdatePostReqBody),
        defaultValues: {
            audience: Audience.PUBLIC,
            content: "",
            hashtags: [],
            medias: [],
            mentions: [],
            thumbnail_url: "",
        },
    });

    const [videoUrl, setVideoUrl] = useState<string | null>(null);

    const videoFrames = useVideoFrames(videoUrl, 10);

    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

    useEffect(() => {
        if (!id) {
            router.push(`/tiktokstudio/upload`);
        }
    }, [id, router]);

    useEffect(() => {
        if (post) {
            form.setValue("content", post.content);
            form.setValue("audience", post.audience);
            form.setValue("medias", post.medias);
            form.setValue("thumbnail_url", post.thumbnail_url);
            setVideoUrl(post.medias?.[0]?.url || null);
            setThumbnailUrl(post.thumbnail_url || null);
        }
    }, [post, form]);

    useEffect(() => {
        if (!thumbnailFile) {
            setThumbnailUrl(post?.thumbnail_url ?? null);
            return;
        }
        const url = URL.createObjectURL(thumbnailFile);
        setThumbnailUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [thumbnailFile, post]);

    const onReset = () => {
        setThumbnailFile(null);
        form.reset();
    };

    const isCreatePostLoading = createPostResult.isLoading || uploadImageResult.isLoading;

    const onsubmit = async (data: UpdatePostReqBodyType) => {
        if (isCreatePostLoading || !post) return;
        try {
            let thumbnailUrl = data.thumbnail_url;
            if (thumbnailFile) {
                const formdata = new FormData();
                formdata.append("file", thumbnailFile);

                const res = await uploadImageMutate(formdata).unwrap();
                thumbnailUrl = res.data[0].url;
            }

            const body: UpdatePostReqBodyType = {
                ...data,
                thumbnail_url: thumbnailUrl,
            };
            await updatePostMutate({ post_id: post._id, body }).unwrap();
            if (redirectFrom) {
                router.push(redirectFrom);
            } else {
                router.push("/tiktokstudio/content");
            }
        } catch (error) {
            console.error(error);
            handleFormError<CreatePostReqBodyType>({
                error,
                setFormError: form.setError,
            });
        }
    };

    const onCancel = () => {
        if (isCreatePostLoading) return;
        if (redirectFrom) {
            router.push(redirectFrom);
        } else {
            router.push("/tiktokstudio/content");
        }
    };
    const content = form.watch("content");

    const hashPermission = currentUser?._id == post?.user_id;

    if (isLoading || error || !currentUser || !hashPermission) {
        return (
            <div className="h-[calc(100vh-4.25rem)] flex items-center justify-center">
                <LoadingIcon className="size-15 mx-auto" loop />
            </div>
        );
    }

    return (
        <Form {...form}>
            <AlertDialogExitPage isOpen={isOpenModalConfirmExit} onCancel={stayHere} onConfirm={leavePage} />
            <SearchParamsLoader onParamsReceived={setSearchParams} />
            <form onSubmit={form.handleSubmit(onsubmit)} onReset={onReset} method="POST" className="relative">
                <div className="grid grid-cols-[70%_30%] gap-4">
                    <div>
                        <div className="mt-5 text-base font-bold">Detail</div>
                        <div className="rounded-lg border border-border p-5 mt-[16px]">
                            <FormField
                                control={form.control}
                                name="content"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-semibold">Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                className="resize-none bg-accent"
                                                rows={5}
                                                placeholder="Share more about your video here ..."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>{content?.length ?? 0}/4000</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex mt-7 mb-2 items-center gap-2 text-sm font-semibold">
                                Cover
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Info size={14} className="text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent align="center" className="w-2xs">
                                        <p>
                                            Select a cover or upload one from your device. An engaging cover can capture
                                            viewers interest effectively.
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                            <SelectThumbnailDialog
                                setCoverImage={setThumbnailFile}
                                videoSrc={videoUrl}
                                imageSrc={thumbnailUrl}
                                videoFrames={videoFrames}
                            />
                        </div>

                        <div className="mt-5 text-base font-bold">Settings</div>
                        <div className="rounded-lg border border-border p-5 mt-[16px] ">
                            <FormField
                                control={form.control}
                                name="audience"
                                render={({ field }) => (
                                    <FormItem className="w-[280px]">
                                        <FormLabel className="text-sm font-semibold">
                                            Who can watch this video
                                        </FormLabel>
                                        <Select
                                            onValueChange={(value) => field.onChange(Number(value))}
                                            defaultValue={field?.value?.toString() ?? Audience.PUBLIC.toString()}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="w-full ">
                                                    <SelectValue placeholder="Select an audience" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {audienceStatusValues.map((status) => (
                                                    <SelectItem key={status} value={status.toString()}>
                                                        {getAudienceNameFromEnum(status)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="flex gap-4 mt-10">
                            <Button
                                className="primary-button cursor-pointer h-9! rounded-lg! w-[200px]! font-medium!"
                                type="submit"
                                disabled={isCreatePostLoading}
                            >
                                {isCreatePostLoading ? <Loader className="animate-spin text-brand" /> : "Save"}
                            </Button>
                            <Button
                                variant={"secondary"}
                                type="button"
                                className="cursor-pointer h-9 rounded-lg w-[200px] font-base"
                                onClick={onCancel}
                                disabled={isCreatePostLoading}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                    <VideoPreview content={content ?? ""} videoSrc={videoUrl} className="mt-5 mx-auto" />
                </div>
            </form>
        </Form>
    );
}
