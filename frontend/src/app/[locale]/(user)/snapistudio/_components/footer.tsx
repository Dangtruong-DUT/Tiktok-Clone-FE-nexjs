import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { LEGAL_ROUTES } from '@/constants/routes/routes'

export default function Footer() {
    const t = useTranslations('SnapiStudio.footer')

    return (
        <footer className=' border-t border-border p-8 flex justify-between items-center'>
            <span className='text-muted-foreground text-xs'>{t('copyright')}</span>
            <div className='flex gap-6'>
                <Link href={LEGAL_ROUTES.PRIVACY_POLICY} className='text-muted-foreground text-xs'>
                    {t('privacyPolicy')}
                </Link>
                <Link href={LEGAL_ROUTES.TERMS_OF_SERVICE} className='text-muted-foreground text-xs'>
                    {t('termsOfService')}
                </Link>
            </div>
        </footer>
    )
}
