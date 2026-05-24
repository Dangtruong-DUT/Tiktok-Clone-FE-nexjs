import type { Metadata } from 'next'
import './globals.css'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { LocalesType } from '@/i18n/config'
import { tiktokDisplayFont, tiktokFont } from '@/config/font'
import { ThemeProvider } from '@/provider/theme-provider'
import { AppProvider } from '@/provider/app-provider'
import StoreProvider from '@/provider/store-provider'
import envConfig from '@/config/app.config'
import { AUTH_COOKIE } from '@/constants/auth'
import { getAuthCookies } from '@/utils/auth/cookies.util'
import { cookies } from 'next/headers'

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params

    return {
        title: {
            template: '%s | Snapi',
            default: 'Snapi'
        },
        description: 'Snapi',
        authors: [{ name: 'TaplamIT', url: 'https://taplamit.com' }],
        openGraph: {
            title: 'Snapi',
            description: 'Snapi',
            locale,
            type: 'website',
            url: `${envConfig.NEXT_PUBLIC_URL}/${locale}`,
            siteName: 'Snapi',
            images: [
                {
                    url: 'https://api.taplamit.tech/api/v1/static/images/72e81f3e59013ce9726567704.jpg',
                    width: 1200,
                    height: 630,
                    alt: 'TaplamIT - Snapi'
                }
            ]
        },
        creator: 'Trường Nguyễn Đăng',
        publisher: 'Trường Nguyễn Đăng',
        alternates: {
            canonical: '/',
            languages: {
                'en-US': '/en-US',
                'vi-VN': '/vi-VN'
            }
        },
        formatDetection: {
            email: false,
            address: false,
            telephone: false
        },
        icons: {
            icon: '/images/logo/favicon.svg'
        }
    }
}

export default async function LocaleLayout({
    children,
    params
}: Readonly<{
    children: React.ReactNode
    params: Promise<{ locale: LocalesType }>
}>) {
    const { locale } = await params
    if (!hasLocale(routing.locales, locale)) {
        notFound()
    }

    const cookieStore = await cookies()
    const hasAccessToken = !!getAuthCookies(cookieStore, AUTH_COOKIE.ACCESS_TOKEN)

    return (
        <html lang={locale} suppressHydrationWarning>
            <body className={`${tiktokDisplayFont.variable} ${tiktokFont.variable} antialiased`}>
                <NextIntlClientProvider>
                    <StoreProvider>
                        <AppProvider initialAuthenticated={hasAccessToken}>
                            <ThemeProvider
                                attribute='class'
                                defaultTheme='system'
                                enableSystem
                                disableTransitionOnChange
                            >
                                {children}
                            </ThemeProvider>
                        </AppProvider>
                    </StoreProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    )
}
