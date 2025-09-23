import { generateTimeLineFrames } from "@/utils/video";
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("generateTimeLineFrames", () => {
    let mockVideo: Partial<HTMLVideoElement>;
    let mockCanvas: Partial<HTMLCanvasElement>;
    let mockCtx: Partial<CanvasRenderingContext2D>;
    const frameCount = 3;
    beforeEach(() => {
        mockCtx = {
            drawImage: vi.fn(),
        };

        mockCanvas = {
            getContext: vi.fn().mockReturnValue(mockCtx),
            toDataURL: vi.fn().mockReturnValue("data:image/jpeg;base64,mocked"),
            width: 0,
            height: 0,
        };

        vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
            if (tag === "video") {
                return mockVideo as HTMLVideoElement;
            }
            if (tag === "canvas") {
                return mockCanvas as HTMLCanvasElement;
            }
            return document.createElement(tag);
        });

        mockVideo = {
            duration: 10,
            videoWidth: 100,
            videoHeight: 100,
            addEventListener: vi.fn((event, cb) => {
                if (event === "loadedmetadata") {
                    setTimeout(() => (cb as EventListener)({} as Event), 0);
                }
                if (event === "seeked") {
                    let called = 0;
                    const interval = setInterval(() => {
                        (cb as EventListener)({} as Event);
                        called++;
                        if (called >= frameCount) clearInterval(interval);
                    }, 0);
                }
            }),
            set src(_url: string) {},
            set currentTime(_t: number) {},
        };
    });

    it("should generate frames with correct length", async () => {
        const frames = await generateTimeLineFrames("mockVideo.mp4", frameCount);

        expect(frames).toHaveLength(frameCount);
        expect(frames[0]).toHaveProperty("time", 0);
        expect(frames[0].image).toContain("data:image/jpeg");
    });
});
