import localFont from "next/font/local";

export const tiktokFont = localFont({
    src: [
        {
            path: "../assets/fonts/TikTokFont-Regular.woff2",
            weight: "400",
            style: "normal",
        },
        {
            path: "../assets/fonts/TikTokFont-Semibold.woff2",
            weight: "600",
            style: "normal",
        },
        {
            path: "../assets/fonts/TikTokFont-Bold.woff2",
            weight: "700",
            style: "normal",
        },
    ],
    display: "swap",
    variable: "--font-tiktok",
});

export const tiktokDisplayFont = localFont({
    src: [
        {
            path: "../assets/fonts/TikTokDisplayFont-Bold.woff2",
            weight: "700",
            style: "normal",
        },
    ],
    display: "swap",
    variable: "--font-tiktok-display",
});
