export async function generateVideoThumbnail(videoUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const video = document.createElement("video");
        const canvas = document.createElement("canvas");

        video.src = videoUrl;
        video.crossOrigin = "anonymous";
        video.preload = "metadata";
        video.muted = true;
        video.playsInline = true;

        video.addEventListener("loadeddata", () => {
            video.currentTime = 1;
        });

        video.addEventListener("seeked", () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const ctx = canvas.getContext("2d");
            if (!ctx) return reject("Cannot get canvas context");

            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageUrl = canvas.toDataURL("image/jpeg");
            resolve(imageUrl);
        });

        video.addEventListener("error", (e) => {
            reject("Video load error");
        });
    });
}
