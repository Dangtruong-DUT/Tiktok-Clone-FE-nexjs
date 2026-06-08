import { AuthNav } from '@/app/[locale]/(public)/(auth)/_components/auth-nav'
import Footer from '@/components/public/footer-v1'
import Header from '@/components/public/header-v1'
import { LocalesType } from '@/i18n/config'
import { Link } from '@/i18n/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Metadata, ResolvingMetadata } from 'next'
import { set } from 'lodash'
import { LEGAL_ROUTES } from '@/constants/routes/routes'

export async function generateMetadata(
    { params }: { params: Promise<{ locale: LocalesType }> },
    parent: ResolvingMetadata
): Promise<Metadata> {
    setRequestLocale((await params).locale)
    const t = await getTranslations('SignUpPage')
    const parentMeta = await parent
    const images = parentMeta.openGraph?.images || []
    return {
        title: {
            template: `%s | Snapi`,
            default: t('title')
        },
        description: t('description'),
        openGraph: {
            title: t('title'),
            description: t('description'),
            images: [...images]
        }
    }
}

export default async function AuthLayout({
    children,
    params
}: {
    children: React.ReactNode
    params: Promise<{ locale: LocalesType }>
}) {
    const { locale } = await params
    setRequestLocale(locale)
    const t = await getTranslations('AuthLayout')
    const headerT = await getTranslations('header')

    return (
        <div className='bg-white text-black '>
            <Header classname='bg-white text-black' helpLabel={headerT('help')} />
            <main className=' h-[calc(100vh-3.75rem-5.25rem-4rem-5rem)] overflow-auto'>{children}</main>
            <div className='mb-4 h-[4rem]'>
                <p className='text-xs text-neutral-500 text-center max-w-sm mx-auto p-4' aria-live='polite'>
                    {t.rich('notice', {
                        terms: (chunks) => (
                            <Link
                                href={LEGAL_ROUTES.TERMS_OF_SERVICE}
                                target='_blank'
                                className='font-semibold text-black hover:underline'
                            >
                                {chunks}
                            </Link>
                        ),
                        privacy: (chunks) => (
                            <Link
                                href={LEGAL_ROUTES.PRIVACY_POLICY}
                                target='_blank'
                                className='font-semibold text-black hover:underline'
                            >
                                {chunks}
                            </Link>
                        )
                    })}
                </p>
            </div>
            <AuthNav />
            <Footer classname='bg-black text-white' />
        </div>
    )
}
