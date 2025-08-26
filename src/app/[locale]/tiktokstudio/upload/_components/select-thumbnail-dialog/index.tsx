import SelectThumbnailFromOriginalVideo from "@/app/[locale]/tiktokstudio/upload/_components/select-thumbnail-dialog/select-thumbnail-from-original-video";
import UploadThumbnailFromDevice from "@/app/[locale]/tiktokstudio/upload/_components/select-thumbnail-dialog/upload-thumbnail";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { BsFillImageFill } from "react-icons/bs";
import { useState } from "react";

type SelectThumbnailMode = "UPLOAD" | "SELECT_FROM_VIDEO";

interface SelectThumbnailDialogProps {
    setCoverImage: (image: File) => void;
    videoSrc: string | null;
    imageSrc: string | null;
}

export default function SelectThumbnailDialog({ setCoverImage, videoSrc, imageSrc }: SelectThumbnailDialogProps) {
    const [mode, setMode] = useState<SelectThumbnailMode>("SELECT_FROM_VIDEO");
    return (
        <Dialog>
            <DialogTrigger asChild disabled={!videoSrc}>
                <div className="w-[132px] h-[176px] rounded-md overflow-hidden relative cursor-pointer border border-border">
                    {imageSrc && (
                        <Image
                            src={imageSrc || "/images/desktop-wallpaper-tiktok.jpg"}
                            alt="Cover image"
                            className="mx-auto"
                            width={132}
                            height={176}
                        />
                    )}
                    {!imageSrc && (
                        <div className="w-[132px] h-[176px] flex items-center justify-center bg-card">
                            <BsFillImageFill />
                        </div>
                    )}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 block w-[90%]">
                        <div className=" px-6 py-1 text-xs rounded-xs bg-accent/50 text-white">Edit cover</div>
                    </div>
                </div>
            </DialogTrigger>
            <DialogContent className=" p-0! gap-0! overflow-hidden">
                <DialogHeader className="hidden">
                    <DialogTitle>select thumbnail dialog</DialogTitle>
                </DialogHeader>
                <ul className="flex gap-4 text-md font-semibold last:mr-auto border-b border-border">
                    <li
                        onClick={() => setMode("SELECT_FROM_VIDEO")}
                        className={cn("px-8 py-4 cursor-pointer", {
                            "text-brand": mode === "SELECT_FROM_VIDEO",
                        })}
                    >
                        Select cover
                    </li>
                    <li
                        onClick={() => setMode("UPLOAD")}
                        className={cn("px-8 py-4  cursor-pointer", {
                            "text-brand": mode === "UPLOAD",
                        })}
                    >
                        Upload cover
                    </li>
                </ul>

                {mode === "SELECT_FROM_VIDEO" && (
                    <SelectThumbnailFromOriginalVideo setCoverImage={setCoverImage} videoSrc={videoSrc!} />
                )}
                {mode === "UPLOAD" && <UploadThumbnailFromDevice />}
            </DialogContent>
        </Dialog>
    );
}
