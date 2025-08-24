"use client";

import { generateVideoThumbnail } from "@/utils/video";
import { useEffect, useState } from "react";

/**
 *
 *  @deprecated This function is deprecated and will be removed in the future.
 *  Please use thumbnail_url was provided in the TikTokPostType instead.
 */

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
