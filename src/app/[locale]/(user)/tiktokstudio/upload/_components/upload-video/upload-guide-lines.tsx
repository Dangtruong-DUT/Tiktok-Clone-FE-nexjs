import { Video, File, MonitorPlay } from "lucide-react";
import { cn } from "@/lib/utils";
import { MdAspectRatio } from "react-icons/md";

interface UploadGuideLineProps {
    className?: string;
}

export default function UploadGuideLine({ className }: UploadGuideLineProps) {
    return (
        <div className={cn("grid grid-cols-4 gap-3", className)}>
            <div className="flex items-start gap-3">
                <Video className="mt-1 size-6 " />
                <div>
                    <h3 className="font-semibold">Size and duration</h3>
                    <p className="text-sm text-muted-foreground">Maximum size: 30 GB, video duration: 60 minutes.</p>
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
                    <p className="text-sm text-muted-foreground">Recommended: 16:9 for landscape, 9:16 for vertical.</p>
                </div>
            </div>
        </div>
    );
}
