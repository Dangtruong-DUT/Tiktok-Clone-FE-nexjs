import { MenuItemsList } from '@/app/[locale]/(public)/(auth)/_components/menu-items'
import { getTranslations } from 'next-intl/server'
import { Metadata } from 'next'
import { LocalesType } from '@/i18n/config'
import envConfig from '@/config/app.config'

export async function generateMetadata({ params }: { params: Promise<{ locale: LocalesType }> }): Promise<Metadata> {
    const { locale } = await params
    const t = await getTranslations('LoginPage')

    return {
        title: t('title'),
        description: t('description'),
        alternates: {
            canonical: `${envConfig.NEXT_PUBLIC_URL}/${locale}/login`,
            languages: {
                'en-US': `${envConfig.NEXT_PUBLIC_URL}/en/login`,
                'vi-VN': `${envConfig.NEXT_PUBLIC_URL}/vi/login`
            }
        }
    }
}

export default async function LoginPage() {
    const t = await getTranslations('LoginPage')
    return (
        <div className='max-w-md mx-auto w-full px-4 sm:px-0 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out fill-mode-forwards'>
            <h1 className='text-3xl tracking-tight font-bold text-center mb-4 mt-16'>{t('title')}</h1>
            <p className='text-center text-base text-muted-foreground mb-8'>{t('description')}</p>
            <div className='glass rounded-xl p-6'>
                <MenuItemsList type='login' />
            </div>
        </div>
    )
}
