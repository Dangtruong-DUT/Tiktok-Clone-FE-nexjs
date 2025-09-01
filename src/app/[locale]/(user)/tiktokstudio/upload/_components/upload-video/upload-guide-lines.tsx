import { Video, File, MonitorPlay } from "lucide-react";
import { cn } from "@/lib/utils";
import { MdAspectRatio } from "react-icons/md";
import { useTranslations } from "next-intl";

interface UploadGuideLineProps {
    className?: string;
}

export default function UploadGuideLine({ className }: UploadGuideLineProps) {
    const t = useTranslations("TiktokStudio.upload");
    return (
        <div className={cn("grid grid-cols-4 gap-3", className)}>
            <div className="flex items-start gap-3">
                <Video className="mt-1 size-6 " />
                <div>
                    <h3 className="font-semibold">{t("guidelines.sizeAndDuration.title")}</h3>
                    <p className="text-sm text-muted-foreground">{t("guidelines.sizeAndDuration.description")}</p>
                </div>
            </div>

            <div className="flex items-start gap-3">
                <File className="mt-1 size-6 " />
                <div>
                    <h3 className="font-semibold">{t("guidelines.fileFormats.title")}</h3>
                    <p className="text-sm text-muted-foreground">{t("guidelines.fileFormats.description")}</p>
                </div>
            </div>

            <div className="flex items-start gap-3">
                <MonitorPlay className="mt-1 size-6 " />
                <div>
                    <h3 className="font-semibold">{t("guidelines.videoResolutions.title")}</h3>
                    <p className="text-sm text-muted-foreground">{t("guidelines.videoResolutions.description")}</p>
                </div>
            </div>

            <div className="flex items-start gap-3">
                <MdAspectRatio className="mt-1 size-6 " />
                <div>
                    <h3 className="font-semibold">{t("guidelines.aspectRatios.title")}</h3>
                    <p className="text-sm text-muted-foreground">{t("guidelines.aspectRatios.description")}</p>
                </div>
            </div>
        </div>
    );
}
