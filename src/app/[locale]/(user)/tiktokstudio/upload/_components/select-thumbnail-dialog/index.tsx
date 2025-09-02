import SelectThumbnailFromOriginalVideo from "@/app/[locale]/(user)/tiktokstudio/upload/_components/select-thumbnail-dialog/select-thumbnail-from-original-video";
import UploadThumbnailFromDevice from "@/app/[locale]/(user)/tiktokstudio/upload/_components/select-thumbnail-dialog/upload-thumbnail";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { BsFillImageFill } from "react-icons/bs";
import { useRef, useState } from "react";
import { TimelineFrameType } from "@/utils/video";
import { useTranslations } from "next-intl";

type SelectThumbnailMode = "UPLOAD" | "SELECT_FROM_VIDEO";

interface SelectThumbnailDialogProps {
    setCoverImage: (image: File) => void;
    videoSrc: string | null;
    imageSrc: string | null;
    videoFrames: TimelineFrameType[];
}

export default function SelectThumbnailDialog({
    setCoverImage,
    videoSrc,
    imageSrc,
    videoFrames,
}: SelectThumbnailDialogProps) {
    const t = useTranslations("TiktokStudio.upload.selectThumbnail");
    const [mode, setMode] = useState<SelectThumbnailMode>("SELECT_FROM_VIDEO");
    const buttonCloseRef = useRef<HTMLButtonElement>(null);
    const handleSetCoverImage = (image: File) => {
        setCoverImage(image);
        buttonCloseRef.current?.click();
    };
    return (
        <Dialog>
            <DialogTrigger asChild disabled={!videoSrc}>
                <div className="w-[132px] h-[176px] rounded-md overflow-hidden relative cursor-pointer border border-border">
                    {imageSrc && (
                        <Image
                            src={imageSrc || "/images/desktop-wallpaper-tiktok.jpg"}
                            alt="Cover image"
                            className="mx-auto object-cover w-[132px] h-[176px]"
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
                        <div className=" px-6 py-1 text-xs rounded-xs bg-accent/50 text-white text-center">
                            {t("edit")}
                        </div>
                    </div>
                </div>
            </DialogTrigger>
            <DialogContent className=" p-0! gap-0! overflow-hidden">
                <DialogHeader className="hidden">
                    <DialogTitle>{t("title")}</DialogTitle>
                </DialogHeader>
                <ul className="flex gap-6 text-base font-semibold ">
                    <li
                        onClick={() => setMode("SELECT_FROM_VIDEO")}
                        className={cn(
                            "relative px-6 py-3 cursor-pointer transition-colors duration-200 hover:text-brand",
                            {
                                "text-brand border-b-2 border-brand": mode === "SELECT_FROM_VIDEO",
                                "text-muted-foreground": mode !== "SELECT_FROM_VIDEO",
                            }
                        )}
                    >
                        {t("selectCover")}
                    </li>
                    <li
                        onClick={() => setMode("UPLOAD")}
                        className={cn(
                            "relative px-6 py-3 cursor-pointer transition-colors duration-200 hover:text-brand",
                            {
                                "text-brand border-b-2 border-brand": mode === "UPLOAD",
                                "text-muted-foreground": mode !== "UPLOAD",
                            }
                        )}
                    >
                        {t("uploadCover")}
                    </li>
                </ul>

                <SelectThumbnailFromOriginalVideo
                    setCoverImage={handleSetCoverImage}
                    className={cn("bg-muted", {
                        hidden: mode !== "SELECT_FROM_VIDEO",
                    })}
                    videoFrames={videoFrames}
                />

                <UploadThumbnailFromDevice
                    setCoverImage={handleSetCoverImage}
                    className={cn("bg-muted", {
                        hidden: mode !== "UPLOAD",
                    })}
                />
                <DialogClose className="hidden" ref={buttonCloseRef} />
            </DialogContent>
        </Dialog>
    );
}
