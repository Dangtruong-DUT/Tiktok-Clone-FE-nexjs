import FormUploadVideo from "@/app/[locale]/(user)/tiktokstudio/upload/_components/form-upload-video";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Upload Video",
    description: "Upload and share your videos on TikTok",
};

export default function UploadPage() {
    return (
        <div className="p-8">
            <FormUploadVideo />
        </div>
    );
}
