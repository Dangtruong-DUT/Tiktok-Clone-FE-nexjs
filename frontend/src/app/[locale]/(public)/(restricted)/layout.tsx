import Footer from '@/components/footer-v1'
import { RestrictedHeader } from './_components/restricted-header'
import { LocalesType } from '@/i18n/config'
import { setRequestLocale } from 'next-intl/server'
import { use } from 'react'

export default function RestrictedLayout({
    children,
    params
}: {
    children: React.ReactNode
    params: Promise<{ locale: LocalesType }>
}) {
    const { locale } = use(params)
    setRequestLocale(locale)

    return (
        <div className='bg-white text-black flex flex-col h-screen  overflow-auto'>
            <RestrictedHeader />
            <main className='flex-1 overflow-auto py-10 px-4'>{children}</main>
            <Footer classname='bg-black text-white' />
        </div>
    )
}
