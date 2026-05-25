import Footer from '@/components/public/footer-v1'
import Header from '@/components/public/header-v1'
import { useTranslations } from 'next-intl'

export default function Layout({ children }: { children: React.ReactNode }) {
    const t = useTranslations('header')

    return (
        <div>
            <Header classname='' helpLabel={t('help')} />
            <main className='h-[calc(100vh-3.75rem-5.25rem)] flex overflow-auto'>{children}</main>
            <Footer classname='border-t bg-muted' />
        </div>
    )
}
