import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { LocalesType } from '@/i18n/config'
import { BannedClient } from '../_components/banned-client'

type BannedPageProps = {
    params: Promise<{ locale: LocalesType }>
    searchParams: Promise<{ days?: string; ban_until?: string }>
}

export async function generateMetadata({ params }: { params: Promise<{ locale: LocalesType }> }): Promise<Metadata> {
    const { locale } = await params
    const t = await getTranslations('BannedPage')

    return {
        title: t('title'),
        description: t('description'),
        alternates: {
            canonical: `/${locale}/banned`
        }
    }
}

function formatBanUntil(banUntil: string | undefined, locale: LocalesType): string | null {
    if (!banUntil) return null
    const date = new Date(banUntil)
    if (Number.isNaN(date.getTime())) return null

    return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date)
}

export default async function BannedPage({ params, searchParams }: BannedPageProps) {
    const t = await getTranslations('BannedPage')
    const { locale } = await params
    const { days, ban_until } = await searchParams

    const parsedDays = Number(days)
    const remainingDays = Number.isFinite(parsedDays) ? Math.max(0, Math.ceil(parsedDays)) : null
    const banUntilLabel = formatBanUntil(ban_until, locale)

    return (
        <section className='mx-auto w-full max-w-[520px]'>
            <BannedClient
                remainingDays={remainingDays}
                banUntilLabel={banUntilLabel}
                tTitle={t('title')}
                tDescription={t('description')}
                tLockWithDays={remainingDays !== null ? t('lockWithDays', { days: remainingDays }) : ''}
                tLockWithoutDays={t('lockWithoutDays')}
                tBanUntil={banUntilLabel ? t('banUntil', { date: banUntilLabel }) : ''}
                tNextStepsTitle={t('nextStepsTitle')}
                tNextStepOne={t('nextStepOne')}
                tNextStepTwo={t('nextStepTwo')}
                tAppealCardTitle={t('appealCardTitle')}
                tAppealCardBody={t('appealCardBody')}
                tAppealAction={t('appealAction')}
            />
        </section>
    )
}
