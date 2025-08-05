"use client";

import { generateVideoThumbnail } from "@/utils/video";
import { useEffect, useState } from "react";

export default function useThumbnailGenerator(videoUrl: string) {
    const [thumbnailUrl, setThumbnailUrl] = useState<string>("/images/desktop-wallpaper-tiktok.jpg");

    useEffect(() => {
        generateVideoThumbnail(videoUrl)
            .then((url) => {
                setThumbnailUrl(url);
            })
            .catch((error) => {
                console.error("Error generating video thumbnail:", error);
            });
    }, [videoUrl, setThumbnailUrl]);

    return thumbnailUrl;
}
