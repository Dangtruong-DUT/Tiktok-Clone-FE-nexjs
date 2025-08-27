"use client";

import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import UploadGuideLine from "@/app/[locale]/(user)/tiktokstudio/upload/_components/upload-video/upload-guide-lines";
import { cn } from "@/lib/utils";

interface UploadFileProps {
    onFileSelect: (file: File | null) => void;
    className?: string;
    isInitialRender?: boolean;
    setIsInitialRender: (value: boolean) => void;
}

export interface UploadFileRef {
    resetAndActive: () => void;
}

const UploadFile = forwardRef<UploadFileRef, UploadFileProps>(
    ({ onFileSelect, className, isInitialRender, setIsInitialRender }, ref) => {
        const [isDragActive, setIsDragActive] = useState(false);
        const inputRef = useRef<HTMLInputElement>(null);

        useImperativeHandle(ref, () => ({
            resetAndActive: () => {
                if (inputRef.current) {
                    inputRef.current.value = "";
                    inputRef.current.click();
                    onFileSelect(null);
                }
            },
        }));

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
                setIsInitialRender(false);
            }
        };

        const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files && e.target.files[0] && e.target.files[0].type.startsWith("video/")) {
                onFileSelect(e.target.files[0]);
                setIsInitialRender(false);
            }
        };

        return (
            <div className={cn("border border-border rounded-lg p-6", className)}>
                <div
                    className={cn(
                        "relative  flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed  bg-muted",
                        isDragActive && "border-primary bg-primary/5",
                        {
                            "min-h-[400px] flex-col": isInitialRender,
                            "min-h-[200px] flex-row gap-4": !isInitialRender,
                        }
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
                        ref={inputRef}
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
                    <div
                        className={cn("flex flex-col", {
                            "items-center": isInitialRender,
                            "items-start": !isInitialRender,
                        })}
                    >
                        <h1 className="mb-1 text-2xl font-bold">Select video to upload</h1>
                        <p className="mb-4 text-base text-muted-foreground">Or drag and drop it here</p>
                    </div>

                    {isInitialRender && (
                        <Button className="mb-6 bg-[#FE2C55] font-semibold text-white hover:bg-[#FE2C55]/90">
                            Select video
                        </Button>
                    )}
                </div>
                {isInitialRender && <UploadGuideLine className="mt-8" />}
            </div>
        );
    }
);

UploadFile.displayName = "UploadFile";

export default UploadFile;
