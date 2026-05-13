import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Footer from '@/app/[locale]/(user)/snapistudio/_components/footer'
import { SettingsContent } from './_components/settings-content'

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('SnapiStudio.settings')
    return {
        title: t('page.title'),
        keywords: 'manage, settings'
    }
}

export default async function SettingsPage() {
    const t = await getTranslations('SnapiStudio.settings')

    return (
        <div className='flex min-h-full flex-col'>
            <div className='flex-1 mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 space-y-6'>
                <div>
                    <h1 className='text-2xl font-bold tracking-tight'>{t('page.title')}</h1>
                    <p className='mt-1 text-sm text-muted-foreground'>{t('page.description')}</p>
                </div>
                <SettingsContent />
            </div>
            <Footer />
        </div>
    )
}
