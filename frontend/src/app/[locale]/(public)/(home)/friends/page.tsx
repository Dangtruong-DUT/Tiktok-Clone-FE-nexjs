import VideoScrollWrapper from '@/app/[locale]/(public)/(home)/friends/_components/video-scroll-wrapper'
import { VideosProvider } from '@/app/[locale]/(public)/(home)/friends/_context/videos-provider'
import { getTranslations } from 'next-intl/server'
import { Metadata } from 'next'
import { LocalesType } from '@/i18n/config'
import envConfig from '@/config/app.config'

export async function generateMetadata({ params }: { params: Promise<{ locale: LocalesType }> }): Promise<Metadata> {
    const { locale } = await params
    const t = await getTranslations('HomePage.menu')
    return {
        title: t('friends'),
        description: 'Watch videos from creators who are mutual friends with you on Snapi',
        openGraph: {
            title: t('friends'),
            description: 'Watch videos from creators who are mutual friends with you on Snapi',
            images: ['https://api.taplamit.tech/api/v1/static/images/72e81f3e59013ce9726567704.jpg'],
            url: `${process.env.NEXT_PUBLIC_URL}${locale}/friends`
        },
        alternates: {
            canonical: `${envConfig.NEXT_PUBLIC_URL}/${locale}/friends`,
            languages: {
                'en-US': `${envConfig.NEXT_PUBLIC_URL}/en/friends`,
                'vi-VN': `${envConfig.NEXT_PUBLIC_URL}/vi/friends`
            }
        }
    }
}

export default function FriendsPage() {
    return (
        <div className=' h-screen flex '>
            <VideosProvider>
                <VideoScrollWrapper />
            </VideosProvider>
        </div>
    )
}
