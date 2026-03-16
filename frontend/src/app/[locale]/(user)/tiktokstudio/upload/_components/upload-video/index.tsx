"use client";

import FileInfo from "@/app/[locale]/(user)/tiktokstudio/upload/_components/upload-video/file-info";
import UploadFile, {
    UploadFileRef,
} from "@/app/[locale]/(user)/tiktokstudio/upload/_components/upload-video/upload-file";
import { cn } from "@/lib/utils";
import { useRef } from "react";

interface UploadVideoProps {
    onFileSelect: (file: File | null) => void;
    file: File | null;
    className?: string;
    isInitialRender?: boolean;
    setIsInitialRender: (value: boolean) => void;
    onReset: () => void;
}

export default function UploadVideo({
    onFileSelect,
    file,
    className,
    isInitialRender,
    setIsInitialRender,
    onReset,
}: UploadVideoProps) {
    const uploadFileRef = useRef<UploadFileRef>(null);

    const handleReplaceFile = () => {
        onReset();
        uploadFileRef.current?.resetAndActive();
    };

    return (
        <>
            <UploadFile
                onFileSelect={onFileSelect}
                className={cn(className, {
                    hidden: file != null,
                })}
                isInitialRender={isInitialRender}
                setIsInitialRender={setIsInitialRender}
                ref={uploadFileRef}
            />
            <FileInfo
                file={file}
                className={cn(className, {
                    hidden: file == null,
                })}
                onReplaceFile={handleReplaceFile}
            />
        </>
    );
}
