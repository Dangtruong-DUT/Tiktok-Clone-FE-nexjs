import envConfig from "@/config/app.config";
import { locales } from "@/i18n/config";
import type { MetadataRoute } from "next";

const baseUrl = envConfig.NEXT_PUBLIC_URL || "http://localhost:3000";

const staticRoutes: MetadataRoute.Sitemap = [
    // Main app routes
    {
        url: "",
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 1,
    },
    {
        url: "/upload",
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.8,
    },
    {
        url: "/explore",
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.8,
    },
    {
        url: "/messages",
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.7,
    },
    {
        url: "/activity",
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.7,
    },

    // TikTok Studio routes
    {
        url: "/tiktokstudio",
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.9,
    },
    {
        url: "/tiktokstudio/content",
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.8,
    },
    {
        url: "/tiktokstudio/settings",
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.6,
    },

    // Auth routes
    {
        url: "/auth/login",
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.5,
    },
    {
        url: "/signup",
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.5,
    },
    {
        url: "/forgot-password",
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.4,
    },
    {
        url: "/reset-password",
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.4,
    },

    // Legal routes
    {
        url: "/terms-of-service",
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.3,
    },
    {
        url: "/privacy-policy",
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.3,
    },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Add language variations for each static route
    const localeStaticRoutes = locales.flatMap((locale) =>
        staticRoutes.map((route) => ({
            ...route,
            url: `${baseUrl}${locale}${route.url}`,
        }))
    );

    return [...localeStaticRoutes];
}
