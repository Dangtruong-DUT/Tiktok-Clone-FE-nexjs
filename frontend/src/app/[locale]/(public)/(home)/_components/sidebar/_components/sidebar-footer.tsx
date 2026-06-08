import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { LEGAL_ROUTES } from '@/constants/routes/routes'

export default function SidebarFooter() {
    const t = useTranslations('HomePage.sidebar.footer')

    return (
        <footer className='px-2 pt-2 pb-[75px]'>
            <div className='mt-5 flex flex-col gap-4'>
                <Link
                    href={LEGAL_ROUTES.PRIVACY_POLICY}
                    target='_blank'
                    className='text-muted-foreground text-sm hover:underline font-semibold'
                >
                    {t('privacyPolicy')}
                </Link>
                <Link
                    href={LEGAL_ROUTES.TERMS_OF_SERVICE}
                    target='_blank'
                    className='text-muted-foreground text-sm hover:underline font-semibold'
                >
                    {t('termsOfService')}
                </Link>
            </div>

            <div className='mt-6 pt-4'>
                <p className='text-xs text-muted-foreground leading-relaxed'>{t('copyright')}</p>
            </div>
        </footer>
    )
}
