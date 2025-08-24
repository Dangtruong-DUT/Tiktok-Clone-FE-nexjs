"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Video, File, MonitorPlay } from "lucide-react";
import { cn } from "@/lib/utils";
import { MdAspectRatio } from "react-icons/md";
import Image from "next/image";

interface UploadVideoProps {
    onFileSelect: (file: File | null) => void;
    file: File | null;
    className?: string;
}

export default function UploadVideo({ onFileSelect, file, className }: UploadVideoProps) {
    const [isDragActive, setIsDragActive] = useState(false);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setIsDragActive(true);
        } else if (e.type === "dragleave") {
            setIsDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.type.startsWith("video/")) {
            onFileSelect(droppedFile);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && e.target.files[0].type.startsWith("video/")) {
            onFileSelect(e.target.files[0]);
        }
    };

    return (
        <div className={cn("border border-border rounded-lg p-6", className)}>
            <div
                className={cn(
                    "relative mb-8 flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed  bg-muted",
                    isDragActive && "border-primary bg-primary/5"
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 cursor-pointer opacity-0"
                    onClick={(event) => {
                        (event.target as HTMLInputElement).value = "";
                    }}
                />

                <div className="mb-3">
                    <Image
                        src="/images/upload-page/upload.svg"
                        alt="Upload video"
                        className="mx-auto h-20 w-20"
                        width={72}
                        height={72}
                    />
                </div>

                <h1 className="mb-1 text-2xl font-bold">Select video to upload</h1>
                <p className="mb-4 text-base text-muted-foreground">Or drag and drop it here</p>

                <Button className="mb-6 bg-[#FE2C55] font-semibold text-white hover:bg-[#FE2C55]/90">
                    Select video
                </Button>
            </div>

            <div className="grid grid-cols-4 gap-3">
                <div className="flex items-start gap-3">
                    <Video className="mt-1 size-6 " />
                    <div>
                        <h3 className="font-semibold">Size and duration</h3>
                        <p className="text-sm text-muted-foreground">
                            Maximum size: 30 GB, video duration: 60 minutes.
                        </p>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <File className="mt-1 size-6 " />
                    <div>
                        <h3 className="font-semibold">File formats</h3>
                        <p className="text-sm text-muted-foreground">
                            Recommended: &quot;.mp4&quot;. Other major formats are supported.
                        </p>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <MonitorPlay className="mt-1 size-6 " />
                    <div>
                        <h3 className="font-semibold">Video resolutions</h3>
                        <p className="text-sm text-muted-foreground">High-resolution recommended: 1080p, 1440p, 4K.</p>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <MdAspectRatio className="mt-1 size-6 " />
                    <div>
                        <h3 className="font-semibold">Aspect ratios</h3>
                        <p className="text-sm text-muted-foreground">
                            Recommended: 16:9 for landscape, 9:16 for vertical.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
