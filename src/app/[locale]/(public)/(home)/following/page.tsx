import VideoScrollWrapper from "@/app/[locale]/(public)/(home)/following/_components/video-scroll-wrapper";
import { VideosProvider } from "@/app/[locale]/(public)/(home)/following/_context/videos-provider";

export default function HomePage() {
    return (
        <div className=" h-screen flex ">
            <VideosProvider>
                <VideoScrollWrapper />
            </VideosProvider>
        </div>
    );
}
