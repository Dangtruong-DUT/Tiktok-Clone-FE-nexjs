/**
 *
 *  @deprecated This function is deprecated and will be removed in the future.
 *  Please use thumbnail_url was provided in the TikTokPostType instead.
 */

export async function generateVideoThumbnail(videoUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const video = document.createElement("video");
        const canvas = document.createElement("canvas");

        video.src = videoUrl;
        video.crossOrigin = "anonymous";
        video.preload = "metadata";
        video.preload = "auto";
        video.muted = true;
        video.playsInline = true;

        video.addEventListener("loadedmetadata", () => {
            video.currentTime = video.duration / 2;
        });

        video.addEventListener("seeked", () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const ctx = canvas.getContext("2d");
            if (!ctx) return reject("Cannot get canvas context");

            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageUrl = canvas.toDataURL("image/jpeg", 0.4);
            resolve(imageUrl);
        });

        video.addEventListener("error", () => {
            reject("Video load error");
        });
    });
}
