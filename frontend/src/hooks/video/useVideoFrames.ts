"use client";

import { generateTimeLineFrames, TimelineFrameType } from "@/utils/video";
import { useEffect, useState } from "react";

export default function useVideoFrames(VideoSrc: string | null, frameCount: number) {
    const [frames, setFrames] = useState<TimelineFrameType[]>([]);

    useEffect(() => {
        if (!VideoSrc) {
            setFrames([]);
            return;
        }

        generateTimeLineFrames(VideoSrc, frameCount)
            .then((generatedFrames) => {
                setFrames(generatedFrames);
            })
            .catch((error) => {
                setFrames([]);
                console.error("Error generating frames:", error);
            });
    }, [VideoSrc, frameCount]);

    return frames;
}
