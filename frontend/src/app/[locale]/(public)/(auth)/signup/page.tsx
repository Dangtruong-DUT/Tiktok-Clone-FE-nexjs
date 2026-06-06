import { MenuItemsList } from '@/app/[locale]/(public)/(auth)/_components/menu-items'
import { getTranslations } from 'next-intl/server'
import { Metadata } from 'next'
import { LocalesType } from '@/i18n/config'
import envConfig from '@/config/app.config'

export async function generateMetadata({ params }: { params: Promise<{ locale: LocalesType }> }): Promise<Metadata> {
    const { locale } = await params
    const t = await getTranslations('SignUpPage')

    return {
        title: t('title'),
        description: t('description'),
        alternates: {
            canonical: `${envConfig.NEXT_PUBLIC_URL}/${locale}/signup`,
            languages: {
                'en-US': `${envConfig.NEXT_PUBLIC_URL}/en/signup`,
                'vi-VN': `${envConfig.NEXT_PUBLIC_URL}/vi/signup`
            }
        }
    }
}

export default async function SignUpPage() {
    const t = await getTranslations('SignUpPage')
    return (
        <div className='max-w-md mx-auto w-full px-4 sm:px-0 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out fill-mode-forwards'>
            <h1 className='text-3xl tracking-tight font-bold text-center mb-4 mt-16'>{t('title')}</h1>
            <p className='text-center text-base text-muted-foreground mb-8'>{t('description')}</p>
            <div className='glass rounded-xl p-6'>
                <MenuItemsList type='signup' />
            </div>
        </div>
    )
}
