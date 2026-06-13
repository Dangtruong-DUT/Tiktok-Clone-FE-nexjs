import { motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { APP_ROUTES } from '@/constants/routes/routes'

interface PendingAppealScreenProps {
    uuid: string
}

export function PendingAppealScreen({ uuid }: PendingAppealScreenProps) {
    const t = useTranslations('AppealPage')

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className='w-full rounded-3xl border border-amber-200 bg-amber-50/60 p-8 shadow-lg shadow-amber-100/60 md:p-10'
        >
            <div className='flex flex-col items-center text-center gap-5'>
                <div className='rounded-2xl bg-amber-100 p-4 ring-8 ring-amber-50'>
                    <AlertTriangle className='h-8 w-8 text-amber-600' />
                </div>
                <div className='space-y-1.5'>
                    <h1 className='text-xl font-bold text-amber-900 tracking-tight'>{t('pending.title')}</h1>
                    <p className='text-amber-700 max-w-md text-sm leading-relaxed'>{t('pending.description')}</p>
                </div>
                <Link
                    href={`${APP_ROUTES.APPEAL}?appeal_uuid=${uuid}`}
                    className='inline-flex items-center gap-2 rounded-2xl bg-amber-600 px-7 py-3 text-sm font-semibold text-white transition-all hover:bg-amber-700 hover:scale-[1.02] active:scale-[0.98] shadow-sm'
                >
                    {t('pending.viewAppeal')}
                </Link>
            </div>
        </motion.div>
    )
}
