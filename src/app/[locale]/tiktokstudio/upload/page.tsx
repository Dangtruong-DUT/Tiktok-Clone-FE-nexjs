"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import UploadVideo from "@/app/[locale]/tiktokstudio/upload/_components/upload-video";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { CreatePostReqBody, CreatePostReqBodyType } from "@/utils/validations/post.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Audience } from "@/constants/enum";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { Info } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function UploadPage() {
    const form = useForm<CreatePostReqBodyType>({
        resolver: zodResolver(CreatePostReqBody),
        defaultValues: {
            audience: Audience.PUBLIC,
            content: "",
            hashtags: [],
            medias: [],
            mentions: [],
        },
    });

    const [file, setFile] = useState<File | null>(null);

    return (
        <div className="p-8">
            <Form {...form}>
                <form>
                    <UploadVideo onFileSelect={setFile} file={file} className="mb-8" />
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
                                            <FormDescription>0/4000</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="flex mt-7 mb-2 items-center gap-2 text-sm font-semibold">
                                    Cover
                                    <Tooltip>
                                        <TooltipTrigger>
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
                                <div className="w-[132px] h-[176px] rounded-md overflow-hidden relative cursor-pointer">
                                    <Image
                                        src="/images/desktop-wallpaper-tiktok.jpg"
                                        alt="Cover image"
                                        className="mx-auto"
                                        width={132}
                                        height={176}
                                    />
                                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 block w-[90%]">
                                        <div className=" px-8 py-1 text-xs rounded-xs bg-accent/50 text-white">
                                            Edit cover
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5 text-base font-bold">Settings</div>
                            <div className="rounded-lg border border-border p-5 mt-[16px]">
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
                                                    <SelectTrigger className="w-full bg-accent">
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
                            <div className="flex gap-4 mt-5">
                                <Button
                                    className="primary-button cursor-pointer h-9! rounded-lg! w-[200px]!"
                                    type="submit"
                                >
                                    Post
                                </Button>
                                <Button
                                    variant={"secondary"}
                                    type="reset"
                                    className="cursor-pointer h-9 rounded-lg w-[200px]"
                                >
                                    Discard
                                </Button>
                            </div>
                        </div>
                        <div>
                            <h2>Preview</h2>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    );
}
