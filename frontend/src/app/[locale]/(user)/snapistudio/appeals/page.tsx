import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { LocalesType } from '@/i18n/config'
import envConfig from '@/config/app.config'
import { StudioAppealsTable } from './_components/studio-appeals-table'

export async function generateMetadata({ params }: { params: Promise<{ locale: LocalesType }> }): Promise<Metadata> {
    const { locale } = await params
    const t = await getTranslations('SnapiStudio.appeals.list')

    return {
        title: t('title'),
        description: t('description'),
        alternates: {
            canonical: `${envConfig.NEXT_PUBLIC_URL}/${locale}/snapistudio/appeals`,
            languages: {
                'en-US': `${envConfig.NEXT_PUBLIC_URL}/en/snapistudio/appeals`,
                'vi-VN': `${envConfig.NEXT_PUBLIC_URL}/vi/snapistudio/appeals`
            }
        }
    }
}

export default function StudioAppealsPage() {
    return (
        <div className='max-w-6xl mx-auto p-4 md:p-6 space-y-3'>
            <StudioAppealsTable />
        </div>
    )
}
