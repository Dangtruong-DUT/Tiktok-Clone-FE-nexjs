import Footer from '@/components/public/footer-v1'
import Header from '../public/header-v1'

type ErrorPagesLayoutProps = {
    children: React.ReactNode
    helpLabel: string
    showLanguageSelector?: boolean
    useIntlLink?: boolean
}

export function ErrorPagesLayout({
    children,
    helpLabel,
    showLanguageSelector = true,
    useIntlLink = true
}: ErrorPagesLayoutProps) {
    return (
        <div className='flex h-full flex-col bg-white text-black'>
            <Header helpLabel={helpLabel} useIntlLink={useIntlLink} />
            <main className='flex flex-1 items-center justify-center py-8'>{children}</main>
            <Footer classname='bg-black text-white' showLanguageSelector={showLanguageSelector} />
        </div>
    )
}
