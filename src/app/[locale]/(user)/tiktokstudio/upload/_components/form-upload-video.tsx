"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import UploadVideo from "@/app/[locale]/(user)/tiktokstudio/upload/_components/upload-video";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { CreatePostReqBody, CreatePostReqBodyType } from "@/utils/validations/post.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Audience, MediaType } from "@/constants/enum";
import { Textarea } from "@/components/ui/textarea";
import { Info } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import VideoPreview from "@/app/[locale]/(user)/tiktokstudio/upload/_components/video-preview";
import SelectThumbnailDialog from "@/app/[locale]/(user)/tiktokstudio/upload/_components/select-thumbnail-dialog";
import { generateTimeLineFrames } from "@/utils/video";
import { convertBase64ToFileToFile } from "@/utils/file";

export default function FormUploadVideo() {
    const [isInitialRender, setIsInitialRender] = useState(true);

    const form = useForm<CreatePostReqBodyType>({
        resolver: zodResolver(CreatePostReqBody),
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
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

    useEffect(() => {
        if (!videoFile) {
            setVideoUrl(null);
            return;
        }
        const url = URL.createObjectURL(videoFile);
        setVideoUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [videoFile]);

    useEffect(() => {
        if (!thumbnailFile) {
            setThumbnailUrl(null);
            return;
        }
        const url = URL.createObjectURL(thumbnailFile);
        setThumbnailUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [thumbnailFile]);

    useEffect(() => {
        const fetchFrame = async () => {
            if (videoUrl) {
                const [frame] = await generateTimeLineFrames(videoUrl, 1);
                const file = await convertBase64ToFileToFile(frame.image, "video_thumbnail.png");
                if (file) setThumbnailFile(file);
            }
        };
        fetchFrame();
    }, [videoUrl]);

    useEffect(() => {
        form.setValue("medias", videoUrl ? [{ type: MediaType.VIDEO, url: videoUrl }] : []);
        form.setValue("thumbnail_url", thumbnailUrl || "");
    }, [form, videoUrl, thumbnailUrl]);

    const content = form.watch("content");

    const onsubmit = async (data: CreatePostReqBodyType) => {};

    const onReset = () => {
        setVideoFile(null);
        setThumbnailFile(null);
        form.reset();
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onsubmit)} onReset={onReset} method="POST">
                <UploadVideo
                    onFileSelect={setVideoFile}
                    file={videoFile}
                    className="mb-8"
                    onReset={onReset}
                    setIsInitialRender={setIsInitialRender}
                    isInitialRender={isInitialRender}
                />
                {!isInitialRender && (
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
                                                Select a cover or upload one from your device. An engaging cover can
                                                capture viewers interest effectively.
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                <SelectThumbnailDialog
                                    setCoverImage={setThumbnailFile}
                                    videoSrc={videoUrl}
                                    imageSrc={thumbnailUrl}
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
                                                onValueChange={field.onChange}
                                                defaultValue={field.value.toString()}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="w-full ">
                                                        <SelectValue placeholder="Select an audience" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value={Audience.PUBLIC.toString()}>Public</SelectItem>
                                                    <SelectItem value={Audience.FRIENDS.toString()}>Friends</SelectItem>
                                                    <SelectItem value={Audience.PRIVATE.toString()}>Private</SelectItem>
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
                                >
                                    Post
                                </Button>
                                <Button
                                    variant={"secondary"}
                                    type="reset"
                                    className="cursor-pointer h-9 rounded-lg w-[200px] font-base"
                                    onClick={onReset}
                                >
                                    Discard
                                </Button>
                            </div>
                        </div>
                        <VideoPreview content={content ?? ""} videoSrc={videoUrl} className="mt-5 mx-auto" />
                    </div>
                )}
            </form>
        </Form>
    );
}
