import envConfig from '@/config/app.config'
import { APP_ROUTES, AUTH_ROUTES, LEGAL_ROUTES, SNAPISTUDIO_ROUTES } from '@/constants/routes/routes'
import { locales } from '@/i18n/config'
import type { MetadataRoute } from 'next'

const baseUrl = envConfig.NEXT_PUBLIC_URL || 'http://localhost:3000'

const staticRoutes: MetadataRoute.Sitemap = [
    {
        url: '',
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1
    },
    {
        url: APP_ROUTES.UPLOAD,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.8
    },
    {
        url: APP_ROUTES.EXPLORE,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.8
    },
    {
        url: APP_ROUTES.ACTIVITY,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.7
    },
    {
        url: SNAPISTUDIO_ROUTES.ROOT,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9
    },
    {
        url: SNAPISTUDIO_ROUTES.CONTENT,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.8
    },
    {
        url: SNAPISTUDIO_ROUTES.SETTINGS,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6
    },
    {
        url: AUTH_ROUTES.LOGIN,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.5
    },
    {
        url: AUTH_ROUTES.SIGN_UP,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.5
    },
    {
        url: AUTH_ROUTES.FORGOT_PASSWORD,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.4
    },
    {
        url: AUTH_ROUTES.RESET_PASSWORD,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.4
    },
    {
        url: LEGAL_ROUTES.TERMS_OF_SERVICE,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.3
    },
    {
        url: LEGAL_ROUTES.PRIVACY_POLICY,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.3
    }
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const localeStaticRoutes = locales.flatMap((locale) =>
        staticRoutes.map((route) => ({
            ...route,
            url: `${baseUrl}${locale}${route.url}`
        }))
    )

    return [...localeStaticRoutes]
}
