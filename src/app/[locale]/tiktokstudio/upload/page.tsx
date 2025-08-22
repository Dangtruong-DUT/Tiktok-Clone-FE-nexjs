"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Video, File, MonitorPlay } from "lucide-react";
import { cn } from "@/lib/utils";
import { MdAspectRatio } from "react-icons/md";

export default function UploadPage() {
    const t = useTranslations("TiktokStudio.upload");
    const [file, setFile] = useState<File | null>(null);
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
            setFile(droppedFile);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    return (
        <div className="container mx-auto p-6">
            <div
                className={cn(
                    "relative mb-8 flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed bg-[#F8F8F8]",
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
                />

                <div className="mb-6">
                    <img src="/images/upload-video-icon.png" alt="Upload video" className="mx-auto h-20 w-20" />
                </div>

                <h1 className="mb-2 text-xl font-semibold">Select video to upload</h1>
                <p className="mb-4 text-base text-muted-foreground">Or drag and drop it here</p>

                <Button className="mb-6 bg-[#FE2C55] font-semibold text-white hover:bg-[#FE2C55]/90">
                    Select video
                </Button>
            </div>

            <div className="grid grid-cols-4 gap-6">
                <div className="flex items-start gap-3">
                    <Video className="mt-1 h-5 w-5 text-muted-foreground" />
                    <div>
                        <h3 className="font-medium">Size and duration</h3>
                        <p className="text-sm text-muted-foreground">
                            Maximum size: 30 GB, video duration: 60 minutes.
                        </p>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <File className="mt-1 h-5 w-5 text-muted-foreground" />
                    <div>
                        <h3 className="font-medium">File formats</h3>
                        <p className="text-sm text-muted-foreground">
                            Recommended: &quot;.mp4&quot;. Other major formats are supported.
                        </p>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <MonitorPlay className="mt-1 h-5 w-5 text-muted-foreground" />
                    <div>
                        <h3 className="font-medium">Video resolutions</h3>
                        <p className="text-sm text-muted-foreground">High-resolution recommended: 1080p, 1440p, 4K.</p>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <MdAspectRatio className="mt-1 h-5 w-5 text-muted-foreground" />
                    <div>
                        <h3 className="font-medium">Aspect ratios</h3>
                        <p className="text-sm text-muted-foreground">
                            Recommended: 16:9 for landscape, 9:16 for vertical.
                        </p>
                    </div>
                </div>
            </div>

            {file && (
                <div className="mt-6 rounded-lg border bg-card p-4">
                    <h4 className="font-medium">Selected file</h4>
                    <p className="text-sm text-muted-foreground">{file.name}</p>
                </div>
            )}
        </div>
    );
}
