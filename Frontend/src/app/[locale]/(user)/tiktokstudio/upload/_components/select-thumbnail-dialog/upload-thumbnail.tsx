"use client";
import { Button } from "@/components/ui/button";
import { CloudUpload } from "lucide-react";
import Image from "next/image";
import { ChangeEvent, DragEvent, MouseEvent, useRef, useState } from "react";

interface UploadThumbnailFromDeviceProps {
    setCoverImage: (image: File) => void;
    className?: string;
}
export default function UploadThumbnailFromDevice({ setCoverImage, className }: UploadThumbnailFromDeviceProps) {
    const [file, setFile] = useState<File | null>(null);

    const inputRef = useRef<HTMLInputElement | null>(null);
    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (files && files.length > 0 && files[0].type.startsWith("image/")) {
            setFile(files[0]);
        }
    };

    const handleOpenFileDialog = () => {
        if (inputRef.current) {
            inputRef.current.value = "";
            inputRef.current.click();
        }
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0 && files[0].type.startsWith("image/")) {
            setFile(files[0]);
        }
        e.target.value = "";
    };

    const onConfirm = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (file) {
            setCoverImage(file);
        }
    };

    return (
        <div className={className}>
            {file && (
                <div className="min-h-[346px] flex items-center justify-center">
                    <Image
                        width={243}
                        height={324}
                        src={URL.createObjectURL(file)}
                        alt="Uploaded Thumbnail "
                        className="w-[243px] h-[324px] object-cover"
                    />
                </div>
            )}
            {!file && (
                <div
                    className="min-h-[346px] flex items-center justify-center"
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={handleOpenFileDialog}
                >
                    <div className=" flex flex-col items-center justify-between ">
                        <CloudUpload size={60} />
                        <span className="text-2xl font-semibold mt-2">Drag and drop a file here</span>
                        <div className="text-lg mt-1">
                            <span>or </span>
                            <span className="text-blue-500">select file</span>
                        </div>
                        <span className="text-sm text-muted-foreground mt-5">
                            Supported formats: JPG, JPEG and PNG.
                        </span>
                    </div>
                </div>
            )}
            {file && (
                <footer className=" flex items-center justify-end p-4 border-t bg-background ">
                    <Button
                        variant={"secondary"}
                        type="button"
                        className="cursor-pointer h-10 rounded-lg mr-2"
                        onClick={handleOpenFileDialog}
                    >
                        Upload new
                    </Button>
                    <Button
                        type="button"
                        className="primary-button h-10! rounded-lg! cursor-pointer text-sm! font-medium!"
                        onClick={onConfirm}
                    >
                        Confirm
                    </Button>
                </footer>
            )}
            <input
                type="file"
                ref={inputRef}
                accept="image/png, image/jpeg, image/jpg"
                className="hidden"
                onChange={handleFileChange}
            />
        </div>
    );
}
