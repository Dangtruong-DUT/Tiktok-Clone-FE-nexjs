export interface TimelineFrameType {
    time: number;
    image: string;
}

export async function generateTimeLineFrames(videoUrl: string, frameCount: number): Promise<TimelineFrameType[]> {
    return new Promise((resolve, reject) => {
        const video = document.createElement("video");
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const frames: TimelineFrameType[] = [];

        video.src = videoUrl;
        video.crossOrigin = "anonymous";
        video.preload = "metadata";
        video.muted = true;
        video.playsInline = true;

        video.addEventListener("loadedmetadata", () => {
            const duration = video.duration;
            const interval = duration / frameCount;
            let currentFrame = 0;

            const captureFrame = () => {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

                frames.push({
                    time: currentFrame,
                    image: canvas.toDataURL("image/jpeg", 0.7),
                });

                currentFrame++;
                if (currentFrame < frameCount) {
                    video.currentTime = currentFrame * interval;
                } else {
                    resolve(frames);
                }
            };

            video.addEventListener("seeked", captureFrame);
            video.currentTime = 0;
        });

        video.addEventListener("error", () => reject("Video load error"));
    });
}
